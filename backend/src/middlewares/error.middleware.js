const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`, { stack: err.stack });

  // Sequelize unique constraint violation (double-booking)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'This time slot is already booked. Please choose another slot.',
    });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e) => e.message),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Default 500
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

module.exports = { errorMiddleware, AppError };
