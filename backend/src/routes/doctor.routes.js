const router = require('express').Router();
const doctorController = require('../controllers/doctor.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateDoctorDto, createSlotDto, blockSlotDto, reviewApplicationDto } = require('../dto/request/doctor.dto');

// Super admin: doctor application review (must precede /:id routes)
router.get('/applications', auth, role('SUPER_ADMIN'), doctorController.getApplications);
router.get('/applications/:id/license', auth, role('SUPER_ADMIN'), doctorController.downloadLicense);
router.patch('/applications/:id', auth, role('SUPER_ADMIN'), validate(reviewApplicationDto), doctorController.reviewApplication);

// Doctor only
router.get('/me/profile', auth, role('DOCTOR'), doctorController.getMyProfile);
router.put('/me/profile', auth, role('DOCTOR'), validate(updateDoctorDto), doctorController.updateProfile);
router.post('/me/slots', auth, role('DOCTOR'), validate(createSlotDto), doctorController.createSlot);
router.patch('/me/slots/:slotId', auth, role('DOCTOR'), validate(blockSlotDto), doctorController.toggleSlotBlock);

// Public
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/slots', doctorController.getSlots);

module.exports = router;
