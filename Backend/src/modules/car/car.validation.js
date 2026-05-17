const Joi = require('joi');

const carImageSchema = Joi.object({
  url: Joi.string().uri().required(),
  sort_order: Joi.number().optional()
});

const carFeatureSchema = Joi.object({
  name: Joi.string().required(),
  value: Joi.string().required()
});

const createCarSchema = Joi.object({
  name: Joi.string().required().trim(),
  brand_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Valid ObjectId
  category_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  price: Joi.number().min(0).required(),
  sale_price: Joi.number().min(0).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
  condition: Joi.string().valid('new', 'used').required(),
  mileage: Joi.number().min(0).optional(),
  fuel_type: Joi.string().valid('gasoline', 'diesel', 'electric', 'hybrid').required(),
  transmission: Joi.string().valid('manual', 'automatic').required(),
  seats: Joi.number().integer().min(1).required(),
  color: Joi.string().required(),
  engine: Joi.string().optional(),
  horsepower: Joi.number().integer().optional(),
  stock: Joi.number().integer().min(0).optional(),
  description: Joi.string().optional(),
  thumbnail: Joi.string().uri().required(),
  is_featured: Joi.boolean().optional(),
  images: Joi.array().items(carImageSchema).optional(),
  features: Joi.array().items(carFeatureSchema).optional()
});

// Update schema makes all fields optional
const updateCarSchema = createCarSchema.fork(Object.keys(createCarSchema.describe().keys), (schema) => schema.optional()).min(1);

module.exports = {
  createCarSchema,
  updateCarSchema
};
