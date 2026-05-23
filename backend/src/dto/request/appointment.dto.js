const Joi = require('joi');

const timeSlot = Joi.string()
  .pattern(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  .required()
  .messages({
    'string.pattern.base': 'Please pick a valid time slot (hours and minutes).',
    'string.empty': 'Please select a time slot for your appointment.',
    'any.required': 'Please select a time slot for your appointment.',
  });

const bookAppointmentDto = Joi.object({
  doctor_id: Joi.string().uuid().required(),
  appointment_date: Joi.date().min('now').required(),
  time_slot: timeSlot,
  notes: Joi.string().max(500).allow('').optional(),
});

const updateStatusDto = Joi.object({
  status: Joi.string().valid('CONFIRMED', 'COMPLETED', 'CANCELLED').required(),
});

const rescheduleDto = Joi.object({
  appointment_date: Joi.date().min('now').required(),
  time_slot: timeSlot,
  notes: Joi.string().max(500).allow('').optional(),
});

module.exports = { bookAppointmentDto, updateStatusDto, rescheduleDto };
