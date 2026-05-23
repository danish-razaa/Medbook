const Joi = require('joi');

const registerDto = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
});

const doctorRegisterDto = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Please enter your full name.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address.',
    'string.empty': 'Please enter your email address.',
  }),
  password: Joi.string().min(8).max(100).required().messages({
    'string.min': 'Password must be at least 8 characters.',
    'string.empty': 'Please enter a password.',
  }),
  specialty: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Please enter your medical specialty.',
  }),
  license_number: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Please enter your medical license number.',
  }),
  bio: Joi.string().max(1000).allow('').optional(),
});

const loginDto = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenDto = Joi.object({
  refresh_token: Joi.string().required(),
});

module.exports = { registerDto, doctorRegisterDto, loginDto, refreshTokenDto };
