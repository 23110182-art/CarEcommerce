const Joi = require('joi');

const createBannerSchema = Joi.object({
  title: Joi.string().required().trim(),
  image: Joi.string().uri().required(),
  link: Joi.string().uri().allow('').optional(),
  is_active: Joi.boolean().optional()
});

const updateBannerSchema = Joi.object({
  title: Joi.string().trim().optional(),
  image: Joi.string().uri().optional(),
  link: Joi.string().uri().allow('').optional(),
  is_active: Joi.boolean().optional()
}).min(1);

module.exports = {
  createBannerSchema,
  updateBannerSchema
};
