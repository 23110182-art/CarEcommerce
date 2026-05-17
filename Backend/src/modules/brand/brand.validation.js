const Joi = require('joi');

const createBrandSchema = Joi.object({
  name: Joi.string().max(50).required().trim(),
  logo: Joi.string().uri().optional(),
  country: Joi.string().trim().optional()
});

const updateBrandSchema = Joi.object({
  name: Joi.string().max(50).trim().optional(),
  logo: Joi.string().uri().optional(),
  country: Joi.string().trim().optional()
}).min(1);

module.exports = {
  createBrandSchema,
  updateBrandSchema
};
