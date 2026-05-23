const Joi = require('joi');

const updateDoctorDto = Joi.object({
  specialty: Joi.string().max(100).optional(),
  bio: Joi.string().max(1000).optional(),
});

const createSlotDto = Joi.object({
  slot_date: Joi.date().min('now').required(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  is_blocked: Joi.boolean().default(false),
});

const blockSlotDto = Joi.object({
  is_blocked: Joi.boolean().required(),
});

const reviewApplicationDto = Joi.object({
  decision: Joi.string().valid('APPROVED', 'REJECTED').required(),
  rejection_reason: Joi.string().max(500).when('decision', {
    is: 'REJECTED',
    then: Joi.required().messages({ 'any.required': 'Please provide a reason for rejection.' }),
    otherwise: Joi.optional().allow('', null),
  }),
});

module.exports = { updateDoctorDto, createSlotDto, blockSlotDto, reviewApplicationDto };
