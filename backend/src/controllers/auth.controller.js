const authService = require('../services/auth.service');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [CUSTOMER] }
 *     responses:
 *       201: { description: Registered successfully }
 *       409: { description: Email already exists }
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({ success: true, message: 'Registration successful', data: result });
  } catch (error) {
    next(error);
  }
};

const applyAsDoctor = async (req, res, next) => {
  try {
    const result = await authService.applyAsDoctor(req.body, req.file);
    return res.status(201).json({
      success: true,
      message: 'Application submitted. A super admin will review it shortly.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and get JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({ success: true, message: 'Login successful', data: result });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  return res.status(200).json({ success: true, data: req.user });
};

module.exports = { register, applyAsDoctor, login, refreshToken, logout, me };
