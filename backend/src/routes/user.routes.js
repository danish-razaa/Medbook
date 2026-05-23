const router = require('express').Router();
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/', auth, role('ADMIN'), userController.getAllUsers);
router.patch('/:id/status', auth, role('ADMIN'), userController.toggleUserStatus);

module.exports = router;
