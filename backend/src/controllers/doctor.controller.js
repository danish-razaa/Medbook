const doctorService = require('../services/doctor.service');

const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    return res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    return res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const doctor = await doctorService.getMyProfile(req.user.id);
    return res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const doctor = await doctorService.updateProfile(req.user.id, req.body);
    return res.status(200).json({ success: true, message: 'Profile updated', data: doctor });
  } catch (error) {
    next(error);
  }
};

const getSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const slots = await doctorService.getSlots(req.params.id, date);
    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
};

const createSlot = async (req, res, next) => {
  try {
    const slot = await doctorService.createSlot(req.user.id, req.body);
    return res.status(201).json({ success: true, message: 'Slot created', data: slot });
  } catch (error) {
    next(error);
  }
};

const toggleSlotBlock = async (req, res, next) => {
  try {
    const { is_blocked } = req.body;
    const slot = await doctorService.toggleSlotBlock(req.user.id, req.params.slotId, is_blocked);
    return res.status(200).json({ success: true, message: 'Slot updated', data: slot });
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const applications = await doctorService.getApplications(req.query.status);
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

const reviewApplication = async (req, res, next) => {
  try {
    const doctor = await doctorService.reviewApplication(
      req.params.id, req.body.decision, req.body.rejection_reason
    );
    return res.status(200).json({ success: true, message: 'Application reviewed', data: doctor });
  } catch (error) {
    next(error);
  }
};

const downloadLicense = async (req, res, next) => {
  try {
    const filePath = await doctorService.getLicenseFilePath(req.params.id);
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
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
  downloadLicense,
};
