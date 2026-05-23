const { Op } = require('sequelize');
const { Appointment, User, Doctor } = require('../models');
const { APPOINTMENT_STATUS } = require('../utils/constants');

const create = async (data, transaction) => {
  return Appointment.create(data, { transaction });
};

const findById = async (id) => {
  return Appointment.findByPk(id, {
    include: [
      { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      { model: Doctor, as: 'doctor', attributes: ['id', 'specialty'] },
    ],
  });
};

const findByCustomerId = async (customerId) => {
  return Appointment.findAll({
    where: { customer_id: customerId },
    include: [{ model: Doctor, as: 'doctor', attributes: ['id', 'specialty'] }],
    order: [['appointment_date', 'DESC'], ['time_slot', 'DESC']],
  });
};

const findByDoctorId = async (doctorId, filters = {}) => {
  const where = { doctor_id: doctorId };
  if (filters.date) where.appointment_date = filters.date;
  if (filters.status) where.status = filters.status;
  return Appointment.findAll({
    where,
    include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }],
    order: [['appointment_date', 'ASC'], ['time_slot', 'ASC']],
  });
};

const findAll = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.date) where.appointment_date = filters.date;
  return Appointment.findAll({
    where,
    include: [
      { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      { model: Doctor, as: 'doctor', attributes: ['id', 'specialty'] },
    ],
    order: [['appointment_date', 'DESC']],
  });
};

const checkConflict = async (doctorId, date, timeSlot, excludeId, transaction) => {
  const where = {
    doctor_id: doctorId,
    appointment_date: date,
    time_slot: timeSlot,
    status: { [Op.in]: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
  };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return Appointment.findOne({ where, transaction, lock: transaction ? true : false });
};

const updateStatus = async (id, status, transaction) => {
  const [, [updated]] = await Appointment.update(
    { status },
    { where: { id }, returning: true, transaction }
  );
  return updated;
};

const update = async (id, data, transaction) => {
  const [, [updated]] = await Appointment.update(data, {
    where: { id },
    returning: true,
    transaction,
  });
  return updated;
};

module.exports = {
  create,
  findById,
  findByCustomerId,
  findByDoctorId,
  findAll,
  checkConflict,
  updateStatus,
  update,
};
