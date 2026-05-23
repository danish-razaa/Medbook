import api from './api';

const getAllDoctors = async () => {
  const res = await api.get('/doctors');
  return res.data.data;
};

const getDoctorById = async (id) => {
  const res = await api.get(`/doctors/${id}`);
  return res.data.data;
};

const getDoctorSlots = async (id, date) => {
  const res = await api.get(`/doctors/${id}/slots`, { params: { date } });
  return res.data.data;
};

const getMyProfile = async () => {
  const res = await api.get('/doctors/me/profile');
  return res.data.data;
};

const updateMyProfile = async (data) => {
  const res = await api.put('/doctors/me/profile', data);
  return res.data.data;
};

const createSlot = async (data) => {
  const res = await api.post('/doctors/me/slots', data);
  return res.data.data;
};

const toggleSlotBlock = async (slotId, is_blocked) => {
  const res = await api.patch(`/doctors/me/slots/${slotId}`, { is_blocked });
  return res.data.data;
};

const getApplications = async (status) => {
  const res = await api.get('/doctors/applications', { params: status ? { status } : {} });
  return res.data.data;
};

const reviewApplication = async (id, decision, rejection_reason) => {
  const res = await api.patch(`/doctors/applications/${id}`, { decision, rejection_reason });
  return res.data.data;
};

const getLicenseBlobUrl = async (id) => {
  const res = await api.get(`/doctors/applications/${id}/license`, { responseType: 'blob' });
  return URL.createObjectURL(res.data);
};

export default {
  getAllDoctors, getDoctorById, getDoctorSlots, getMyProfile, updateMyProfile,
  createSlot, toggleSlotBlock, getApplications, reviewApplication, getLicenseBlobUrl,
};
