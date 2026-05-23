const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');
const doctorRepo = require('../repositories/doctor.repository');
const jwtConfig = require('../config/jwt.config');
const { AppError } = require('../middlewares/error.middleware');
const { ROLES, DOCTOR_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
  return { token, refreshToken };
};

const register = async (dto) => {
  const existing = await userRepo.findByEmail(dto.email);
  if (existing) throw new AppError('Email already registered', 409);

  const hashedPassword = await bcrypt.hash(dto.password, 12);
  const user = await userRepo.create({
    ...dto,
    password: hashedPassword,
    role: ROLES.CUSTOMER,
  });

  const { token, refreshToken } = generateTokens(user);
  await userRepo.updateRefreshToken(user.id, refreshToken);

  logger.info(`New user registered: ${user.email} (${user.role})`);
  return {
    token,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

const applyAsDoctor = async (dto, file) => {
  const existing = await userRepo.findByEmail(dto.email);
  if (existing) throw new AppError('Email already registered', 409);
  if (!file) throw new AppError('Please upload your medical license document (PDF, JPG, or PNG).', 400);

  const hashedPassword = await bcrypt.hash(dto.password, 12);
  const user = await userRepo.create({
    name: dto.name,
    email: dto.email,
    password: hashedPassword,
    role: ROLES.DOCTOR,
  });

  await doctorRepo.create({
    user_id: user.id,
    specialty: dto.specialty,
    bio: dto.bio || null,
    license_number: dto.license_number,
    license_document: file.filename,
    approval_status: DOCTOR_STATUS.PENDING,
  });

  logger.info(`Doctor application submitted: ${user.email}`);
  return { email: user.email };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError('Invalid credentials', 401);
  if (!user.is_active) throw new AppError('Account is deactivated', 403);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new AppError('Invalid credentials', 401);

  if (user.role === ROLES.DOCTOR) {
    const doctor = await doctorRepo.findByUserId(user.id);
    if (!doctor || doctor.approval_status === DOCTOR_STATUS.PENDING) {
      throw new AppError(
        'Your doctor application is pending super admin approval. You can sign in once it is approved.',
        403
      );
    }
    if (doctor.approval_status === DOCTOR_STATUS.REJECTED) {
      const reason = doctor.rejection_reason ? ` Reason: ${doctor.rejection_reason}` : '';
      throw new AppError(`Your doctor application was rejected.${reason}`, 403);
    }
  }

  const { token, refreshToken } = generateTokens(user);
  await userRepo.updateRefreshToken(user.id, refreshToken);

  logger.info(`User logged in: ${user.email}`);
  return {
    token,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

const refreshToken = async ({ refresh_token }) => {
  try {
    const decoded = jwt.verify(refresh_token, jwtConfig.refreshSecret);
    const user = await userRepo.findByIdWithPassword(decoded.id);
    if (!user || user.refresh_token !== refresh_token) {
      throw new AppError('Invalid refresh token', 401);
    }
    const tokens = generateTokens(user);
    await userRepo.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

const logout = async (userId) => {
  await userRepo.updateRefreshToken(userId, null);
  logger.info(`User logged out: ${userId}`);
};

module.exports = { register, applyAsDoctor, login, refreshToken, logout };
