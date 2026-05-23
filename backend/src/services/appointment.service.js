const { sequelize } = require('../config/db.config');
const appointmentRepo = require('../repositories/appointment.repository');
const doctorRepo = require('../repositories/doctor.repository');
const userRepo = require('../repositories/user.repository');
const { AppError } = require('../middlewares/error.middleware');
const { APPOINTMENT_STATUS, STATUS_TRANSITIONS } = require('../utils/constants');
const notifier = require('../utils/notifier');
const logger = require('../utils/logger');

const bookAppointment = async (dto, customerId) => {
  const apptDate = new Date(dto.appointment_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (apptDate < today) throw new AppError('Cannot book appointments in the past', 400);

  return sequelize.transaction(async (t) => {
    const doctor = await doctorRepo.findById(dto.doctor_id);
    if (!doctor || !doctor.is_active) throw new AppError('Doctor not found or inactive', 404);

    const dateStr = apptDate.toISOString().split('T')[0];
    const slot = await doctorRepo.findAvailableSlot(dto.doctor_id, dateStr, dto.time_slot, t);
    if (!slot) throw new AppError('Selected time slot is not available', 400);

    const conflict = await appointmentRepo.checkConflict(
      dto.doctor_id, dateStr, dto.time_slot, null, t
    );
    if (conflict) {
      logger.warn(`Double-booking attempt: doctor ${dto.doctor_id} on ${dateStr} at ${dto.time_slot}`);
      throw new AppError('This slot is already booked. Please choose another time.', 409);
    }

    const appointment = await appointmentRepo.create({
      customer_id: customerId,
      doctor_id: dto.doctor_id,
      appointment_date: dateStr,
      time_slot: dto.time_slot,
      notes: dto.notes,
      status: APPOINTMENT_STATUS.BOOKED,
    }, t);

    const user = await userRepo.findById(customerId);
    logger.info(`Appointment booked: ${appointment.id} by customer ${customerId}`);

    setImmediate(() => {
      notifier.emit('booking.confirmed', { appointment, user });
    });

    return appointment;
  });
};

const getMyAppointments = async (userId, role) => {
  if (role === 'CUSTOMER') return appointmentRepo.findByCustomerId(userId);
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return appointmentRepo.findAll();
  const doctor = await doctorRepo.findByUserId(userId);
  if (!doctor) throw new AppError('Doctor profile not found', 404);
  return appointmentRepo.findByDoctorId(doctor.id);
};

const getAppointmentById = async (id, userId, role) => {
  const appointment = await appointmentRepo.findById(id);
  if (!appointment) throw new AppError('Appointment not found', 404);

  if (role === 'CUSTOMER' && appointment.customer_id !== userId) {
    throw new AppError('Forbidden', 403);
  }
  if (role === 'DOCTOR') {
    const doctor = await doctorRepo.findByUserId(userId);
    if (!doctor || appointment.doctor_id !== doctor.id) throw new AppError('Forbidden', 403);
  }
  return appointment;
};

const updateStatus = async (appointmentId, newStatus, userId, role) => {
  const appointment = await appointmentRepo.findById(appointmentId);
  if (!appointment) throw new AppError('Appointment not found', 404);

  if (role === 'CUSTOMER') {
    if (newStatus !== APPOINTMENT_STATUS.CANCELLED) throw new AppError('Customers can only cancel appointments', 403);
    if (appointment.customer_id !== userId) throw new AppError('Forbidden', 403);
  }

  const allowed = STATUS_TRANSITIONS[appointment.status];
  if (!allowed.includes(newStatus)) {
    throw new AppError(`Cannot transition from ${appointment.status} to ${newStatus}`, 400);
  }

  const updated = await appointmentRepo.updateStatus(appointmentId, newStatus);
  const user = await userRepo.findById(appointment.customer_id);

  setImmediate(() => {
    if (newStatus === APPOINTMENT_STATUS.CANCELLED) {
      notifier.emit('booking.cancelled', { appointment, user });
    } else if (newStatus === APPOINTMENT_STATUS.COMPLETED) {
      notifier.emit('booking.completed', { appointment });
    }
  });

  logger.info(`Appointment ${appointmentId} status changed: ${appointment.status} → ${newStatus}`);
  return updated;
};

const rescheduleAppointment = async (appointmentId, dto, userId) => {
  const appointment = await appointmentRepo.findById(appointmentId);
  if (!appointment) throw new AppError('Appointment not found', 404);
  if (appointment.customer_id !== userId) throw new AppError('Forbidden', 403);
  if (![APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
    throw new AppError('Cannot reschedule this appointment', 400);
  }

  const apptDate = new Date(dto.appointment_date);
  const dateStr = apptDate.toISOString().split('T')[0];

  return sequelize.transaction(async (t) => {
    const conflict = await appointmentRepo.checkConflict(
      appointment.doctor_id, dateStr, dto.time_slot, appointmentId, t
    );
    if (conflict) throw new AppError('New time slot is already booked', 409);

    const updated = await appointmentRepo.update(appointmentId, {
      appointment_date: dateStr,
      time_slot: dto.time_slot,
      notes: dto.notes || appointment.notes,
      status: APPOINTMENT_STATUS.BOOKED,
    }, t);

    const user = await userRepo.findById(userId);
    setImmediate(() => notifier.emit('booking.rescheduled', { appointment: updated, user }));
    logger.info(`Appointment ${appointmentId} rescheduled to ${dateStr} at ${dto.time_slot}`);
    return updated;
  });
};

const getAllAppointments = async (filters) => {
  return appointmentRepo.findAll(filters);
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateStatus,
  rescheduleAppointment,
  getAllAppointments,
};
