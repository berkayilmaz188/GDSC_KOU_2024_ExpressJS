const Joi = require('joi');

exports.updateAdvertValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    category: Joi.string().optional(),
    tag: Joi.string().optional(),
    city: Joi.string().optional(),
    deadTime: Joi.string().optional(),
    point: Joi.number().optional(),
    status: Joi.string().optional(),    category: Joi.string().optional(),
    visibility: Joi.string().optional(),
    minParticipants: Joi.number().optional()
  }).min(1); // En az bir alanın doldurulması gerekmektedir

  return schema.validate(data);
};