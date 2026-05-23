const { Doctor, User, AvailabilitySlot } = require('../models');
const { DOCTOR_STATUS } = require('../utils/constants');

const findAll = async () => {
  return Doctor.findAll({
    where: { is_active: true, approval_status: DOCTOR_STATUS.APPROVED },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
  });
};

const findApplications = async (status) => {
  const where = {};
  if (status) where.approval_status = status;
  return Doctor.findAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    order: [['created_at', 'DESC']],
  });
};

const findById = async (id) => {
  return Doctor.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
  });
};

const findByUserId = async (userId) => {
  return Doctor.findOne({ where: { user_id: userId } });
};

const create = async (data) => {
  return Doctor.create(data);
};

const update = async (id, data) => {
  const [, [updated]] = await Doctor.update(data, {
    where: { id },
    returning: true,
  });
  return updated;
};

const findSlots = async (doctorId, date) => {
  const where = { doctor_id: doctorId };
  if (date) where.slot_date = date;
  return AvailabilitySlot.findAll({ where, order: [['slot_date', 'ASC'], ['start_time', 'ASC']] });
};

const createSlot = async (data) => {
  return AvailabilitySlot.create(data);
};

const findSlotById = async (id) => {
  return AvailabilitySlot.findByPk(id);
};

const updateSlot = async (id, data) => {
  const [, [updated]] = await AvailabilitySlot.update(data, {
    where: { id },
    returning: true,
  });
  return updated;
};

const findAvailableSlot = async (doctorId, slotDate, startTime, transaction) => {
  return AvailabilitySlot.findOne({
    where: { doctor_id: doctorId, slot_date: slotDate, start_time: startTime, is_blocked: false },
    transaction,
    lock: transaction ? true : false,
  });
};

module.exports = {
  findAll,
  findApplications,
  findById,
  findByUserId,
  create,
  update,
  findSlots,
  createSlot,
  findSlotById,
  updateSlot,
  findAvailableSlot,
};
