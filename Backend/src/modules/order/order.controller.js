const asyncHandler = require("../../shared/utils/asyncHandler");
const ApiResponse = require("../../shared/response/ApiResponse");
const AppError = require("../../shared/errors/AppError");
const orderService = require("./order.service");
const {
  createOrderSchema,
  updateOrderStatusSchema,
  requestCancelOrderSchema,
  reviewCancelRequestSchema,
  orderQuerySchema,
  orderIdParamSchema,
} = require("./order.validation");

function parseAndValidate(schema, value) {
  const { error, value: validated } = schema.validate(value, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new AppError(
      error.details.map((item) => item.message).join(", "),
      400,
    );
  }

  return validated;
}

exports.createOrder = asyncHandler(async (req, res) => {
  const body = parseAndValidate(createOrderSchema, req.body);
  const order = await orderService.createOrder({ user: req.user, body });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const query = parseAndValidate(orderQuerySchema, req.query);
  const result = await orderService.listOrders({
    role: req.user?.role || "customer",
    userId: req.user?._id || req.user?.id,
    filters: query,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Orders retrieved successfully"));
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const { id } = parseAndValidate(orderIdParamSchema, req.params);
  const order = await orderService.getOrderById({
    orderId: id,
    userId: req.user?._id || req.user?.id,
    isAdmin: req.user?.role === "admin",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order retrieved successfully"));
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = parseAndValidate(orderIdParamSchema, req.params);
  const { status } = parseAndValidate(updateOrderStatusSchema, req.body);
  const order = await orderService.updateOrderStatus({
    orderId: id,
    status,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

exports.requestCancelOrder = asyncHandler(async (req, res) => {
  const { id } = parseAndValidate(orderIdParamSchema, req.params);
  const { reason } = parseAndValidate(requestCancelOrderSchema, req.body);
  const order = await orderService.requestCancelOrder({
    orderId: id,
    userId: req.user?._id || req.user?.id,
    reason,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Cancel request processed successfully"));
});

exports.reviewCancelRequest = asyncHandler(async (req, res) => {
  const { id } = parseAndValidate(orderIdParamSchema, req.params);
  const { action, adminNote } = parseAndValidate(
    reviewCancelRequestSchema,
    req.body,
  );
  const order = await orderService.reviewCancelRequest({
    orderId: id,
    action,
    adminId: req.user?._id || req.user?.id,
    adminNote,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Cancel request reviewed successfully"));
});
