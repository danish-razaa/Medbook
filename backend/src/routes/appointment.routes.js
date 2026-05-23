const router = require('express').Router();
const appointmentController = require('../controllers/appointment.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { bookAppointmentDto, updateStatusDto, rescheduleDto } = require('../dto/request/appointment.dto');

router.post('/', auth, role('CUSTOMER'), validate(bookAppointmentDto), appointmentController.bookAppointment);
router.get('/my', auth, appointmentController.getMyAppointments);
router.get('/all', auth, role('ADMIN'), appointmentController.getAllAppointments);
router.get('/:id', auth, appointmentController.getAppointmentById);
router.patch('/:id/status', auth, validate(updateStatusDto), appointmentController.updateStatus);
router.put('/:id/reschedule', auth, role('CUSTOMER'), validate(rescheduleDto), appointmentController.rescheduleAppointment);

module.exports = router;
