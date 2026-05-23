const userService = require('../services/user.service');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    return res.status(200).json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await userService.toggleUserStatus(req.params.id);
    return res.status(200).json({ success: true, message: 'User status updated', data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAllUsers, toggleUserStatus };
