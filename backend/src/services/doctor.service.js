const path = require('path');
const fs = require('fs');
const doctorRepo = require('../repositories/doctor.repository');
const { AppError } = require('../middlewares/error.middleware');
const { DOCTOR_STATUS } = require('../utils/constants');
const { LICENSE_DIR } = require('../config/upload.config');
const logger = require('../utils/logger');

const getAllDoctors = async () => {
  return doctorRepo.findAll();
};

const getDoctorById = async (id) => {
  const doctor = await doctorRepo.findById(id);
  if (!doctor) throw new AppError('Doctor not found', 404);
  return doctor;
};

const getMyProfile = async (userId) => {
  const doctor = await doctorRepo.findByUserId(userId);
  if (!doctor) throw new AppError('Doctor profile not found', 404);
  return doctor;
};

const updateProfile = async (userId, data) => {
  const doctor = await doctorRepo.findByUserId(userId);
  if (!doctor) throw new AppError('Doctor profile not found', 404);
  return doctorRepo.update(doctor.id, data);
};

const getSlots = async (doctorId, date) => {
  return doctorRepo.findSlots(doctorId, date);
};

const createSlot = async (userId, slotData) => {
  const doctor = await doctorRepo.findByUserId(userId);
  if (!doctor) throw new AppError('Doctor profile not found', 404);

  const existingSlots = await doctorRepo.findSlots(doctor.id, slotData.slot_date);
  const hasOverlap = existingSlots.some((s) => {
    return (
      (slotData.start_time >= s.start_time && slotData.start_time < s.end_time) ||
      (slotData.end_time > s.start_time && slotData.end_time <= s.end_time)
    );
  });
  if (hasOverlap) throw new AppError('Slot overlaps with an existing slot', 409);

  logger.info(`Doctor ${doctor.id} created slot on ${slotData.slot_date}`);
  return doctorRepo.createSlot({ ...slotData, doctor_id: doctor.id });
};

const toggleSlotBlock = async (userId, slotId, isBlocked) => {
  const doctor = await doctorRepo.findByUserId(userId);
  if (!doctor) throw new AppError('Doctor profile not found', 404);

  const slot = await doctorRepo.findSlotById(slotId);
  if (!slot) throw new AppError('Slot not found', 404);
  if (slot.doctor_id !== doctor.id) throw new AppError('Forbidden', 403);

  return doctorRepo.updateSlot(slotId, { is_blocked: isBlocked });
};

const getApplications = async (status) => {
  return doctorRepo.findApplications(status);
};

const reviewApplication = async (doctorId, decision, rejectionReason) => {
  const doctor = await doctorRepo.findById(doctorId);
  if (!doctor) throw new AppError('Doctor application not found', 404);
  if (doctor.approval_status === DOCTOR_STATUS.APPROVED) {
    throw new AppError('This doctor is already approved.', 409);
  }

  const update = decision === DOCTOR_STATUS.APPROVED
    ? { approval_status: DOCTOR_STATUS.APPROVED, rejection_reason: null }
    : { approval_status: DOCTOR_STATUS.REJECTED, rejection_reason: rejectionReason };

  logger.info(`Doctor application ${doctorId} reviewed: ${decision}`);
  return doctorRepo.update(doctorId, update);
};

const getLicenseFilePath = async (doctorId) => {
  const doctor = await doctorRepo.findById(doctorId);
  if (!doctor) throw new AppError('Doctor application not found', 404);
  if (!doctor.license_document) throw new AppError('No license document on file', 404);

  const filePath = path.join(LICENSE_DIR, doctor.license_document);
  if (!fs.existsSync(filePath)) throw new AppError('License document file is missing', 404);
  return filePath;
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getMyProfile,
  updateProfile,
  getSlots,
  createSlot,
  toggleSlotBlock,
  getApplications,
  reviewApplication,
  getLicenseFilePath,
};
