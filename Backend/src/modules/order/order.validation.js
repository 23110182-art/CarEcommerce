const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const orderItemSchema = Joi.object({
  car: objectId.required(),
  quantity: Joi.number().integer().min(1).required(),
});

const shippingInfoSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  phone: Joi.string().trim().min(6).max(30),
  address: Joi.string().trim().min(5).max(255),
  note: Joi.string().trim().max(500).allow('', null),
}).or('name', 'phone', 'address');

const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  shippingInfo: shippingInfoSchema,
  name: Joi.string().trim().min(2).max(120),
  phone: Joi.string().trim().min(6).max(30),
  address: Joi.string().trim().min(5).max(255),
  note: Joi.string().trim().max(500).allow('', null),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled')
    .required(),
});

const requestCancelOrderSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('', null),
});

const reviewCancelRequestSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  adminNote: Joi.string().trim().max(500).allow('', null),
});

const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded'),
  cancelRequestStatus: Joi.string().valid('none', 'pending', 'approved', 'rejected'),
  search: Joi.string().trim().min(1).max(100),
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'totalAmount').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const orderIdParamSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  requestCancelOrderSchema,
  reviewCancelRequestSchema,
  orderQuerySchema,
  orderIdParamSchema,
};
