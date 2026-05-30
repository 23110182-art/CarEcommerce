const Joi = require("joi");

const createReviewSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.empty": "productId không được để trống",
    "any.required": "productId là bắt buộc",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.base": "rating phải là một số",
    "number.min": "rating phải từ 1 đến 5",
    "number.max": "rating phải từ 1 đến 5",
    "any.required": "rating là bắt buộc",
  }),
  comment: Joi.string().trim().required().messages({
    "string.empty": "comment không được để trống",
    "any.required": "comment là bắt buộc",
  }),
});

module.exports = {
  createReviewSchema,
};
