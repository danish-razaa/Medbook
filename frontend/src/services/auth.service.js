import api from './api';

const register = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data.data;
};

const applyAsDoctor = async (formData) => {
  const res = await api.post('/auth/apply-doctor', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

const login = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data.data;
};

const logout = async (token) => {
  await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
};

export default { register, applyAsDoctor, login, logout };
