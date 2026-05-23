const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { uploadLicense } = require('../config/upload.config');
const { registerDto, doctorRegisterDto, loginDto, refreshTokenDto } = require('../dto/request/auth.dto');

router.post('/register', validate(registerDto), authController.register);
router.post('/apply-doctor', uploadLicense, validate(doctorRegisterDto), authController.applyAsDoctor);
router.post('/login', validate(loginDto), authController.login);
router.post('/refresh', validate(refreshTokenDto), authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
