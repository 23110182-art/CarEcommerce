const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().max(50).required().trim()
});

const updateCategorySchema = Joi.object({
  name: Joi.string().max(50).trim().required()
});

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
