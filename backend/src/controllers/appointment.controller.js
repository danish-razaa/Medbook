const appointmentService = require('../services/appointment.service');

const bookAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.bookAppointment(req.body, req.user.id);
    return res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
  } catch (error) {
    next(error);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getMyAppointments(req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id, req.user.id, req.user.role
    );
    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const appointment = await appointmentService.updateStatus(
      req.params.id, req.body.status, req.user.id, req.user.role
    );
    return res.status(200).json({ success: true, message: 'Status updated', data: appointment });
  } catch (error) {
    next(error);
  }
};

const rescheduleAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.rescheduleAppointment(
      req.params.id, req.body, req.user.id
    );
    return res.status(200).json({ success: true, message: 'Appointment rescheduled', data: appointment });
  } catch (error) {
    next(error);
  }
};

const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getAllAppointments(req.query);
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateStatus,
  rescheduleAppointment,
  getAllAppointments,
};
