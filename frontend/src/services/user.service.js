import api from './api';

const getProfile = async () => {
  const res = await api.get('/users/profile');
  return res.data.data;
};

const updateProfile = async (data) => {
  const res = await api.put('/users/profile', data);
  return res.data.data;
};

const getAllUsers = async () => {
  const res = await api.get('/users');
  return res.data.data;
};

const toggleUserStatus = async (id) => {
  const res = await api.patch(`/users/${id}/status`);
  return res.data.data;
};

export default { getProfile, updateProfile, getAllUsers, toggleUserStatus };
