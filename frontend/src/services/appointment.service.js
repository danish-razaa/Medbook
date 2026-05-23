import api from './api';

const getMyAppointments = async () => {
  const res = await api.get('/appointments/my');
  return res.data.data;
};

const getAllAppointments = async (filters = {}) => {
  const res = await api.get('/appointments/all', { params: filters });
  return res.data.data;
};

const getAppointmentById = async (id) => {
  const res = await api.get(`/appointments/${id}`);
  return res.data.data;
};

const bookAppointment = async (data) => {
  const res = await api.post('/appointments', data);
  return res.data.data;
};

const updateStatus = async (id, status) => {
  const res = await api.patch(`/appointments/${id}/status`, { status });
  return res.data.data;
};

const rescheduleAppointment = async (id, data) => {
  const res = await api.put(`/appointments/${id}/reschedule`, data);
  return res.data.data;
};

export default { getMyAppointments, getAllAppointments, getAppointmentById, bookAppointment, updateStatus, rescheduleAppointment };
