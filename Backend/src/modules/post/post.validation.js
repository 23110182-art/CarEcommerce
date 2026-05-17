const Joi = require('joi');

const createPostSchema = Joi.object({
  title: Joi.string().required().trim(),
  thumbnail: Joi.string().uri().required(),
  content: Joi.string().required()
});

const updatePostSchema = Joi.object({
  title: Joi.string().trim().optional(),
  thumbnail: Joi.string().uri().optional(),
  content: Joi.string().optional()
}).min(1);

module.exports = {
  createPostSchema,
  updatePostSchema
};
