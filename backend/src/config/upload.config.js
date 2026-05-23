const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { AppError } = require('../middlewares/error.middleware');

const LICENSE_DIR = path.join(__dirname, '../../uploads/licenses');
fs.mkdirSync(LICENSE_DIR, { recursive: true });

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, LICENSE_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `license-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
  cb(new AppError('License document must be a PDF, JPG, or PNG file.', 400));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('license_document');

const uploadLicense = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'License document is too large (max 5 MB).'
        : 'License document upload failed.';
      return next(new AppError(message, 400));
    }
    if (err) return next(err);
    next();
  });
};

module.exports = { uploadLicense, LICENSE_DIR };
