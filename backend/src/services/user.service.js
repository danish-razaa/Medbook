const userRepo = require('../repositories/user.repository');
const { AppError } = require('../middlewares/error.middleware');

const getProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const allowed = { name: data.name };
  const updated = await userRepo.update(userId, allowed);
  return updated;
};

const getAllUsers = async () => {
  return userRepo.findAll();
};

const toggleUserStatus = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return userRepo.update(userId, { is_active: !user.is_active });
};

module.exports = { getProfile, updateProfile, getAllUsers, toggleUserStatus };
