const mongoose = require("mongoose");
const AppError = require("../../shared/errors/AppError");
const orderRepository = require("./order.repository");
const Order = require("./order.model");
const Car = require("../car/car.model");

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipping",
  "delivered",
  "cancelled",
];

function toObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
}

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function resolveCustomer(user) {
  if (!user) {
    throw new AppError("Authenticated user is required", 401);
  }

  return {
    user: user._id || user.id,
    name: user.name || "Customer",
    email: user.email || "",
    phone: user.phone || "",
  };
}

function resolveShippingInfo(body) {
  const shippingInfo = body.shippingInfo || {};

  const name = shippingInfo.name || "";
  const phone = shippingInfo.phone || "";
  const address = shippingInfo.address || "";
  const note = shippingInfo.note || "";

  if (!name || !phone || !address) {
    throw new AppError("Shipping information is required", 400);
  }

  return {
    name: String(name).trim(),
    phone: String(phone).trim(),
    address: String(address).trim(),
    note: note ? String(note).trim() : "",
  };
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Order items are required", 400);
  }

  const grouped = new Map();

  items.forEach((item) => {
    const carId = item.car;
    const quantity = Number(item.quantity);

    if (!toObjectId(carId)) {
      throw new AppError("Each order item must contain a valid carId", 400);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError("Each order item quantity must be at least 1", 400);
    }

    const key = String(carId);
    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += quantity;
      return;
    }

    grouped.set(key, {
      car: String(carId),
      quantity,
    });
  });

  return Array.from(grouped.values());
}

function resolveCarName(car) {
  return car.name || car.title || car.model || "Car";
}

function resolveCarImage(car) {
  if (Array.isArray(car.images) && car.images.length > 0) {
    return car.images[0].url;
  }

  return car.image || car.thumbnail || null;
}

function resolveCarPrice(car) {
  const price =
    car.price ?? car.current_price ?? car.salePrice ?? car.sale_price;
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    throw new AppError(
      `Invalid price configured for car ${resolveCarName(car)}`,
      400,
    );
  }

  return numericPrice;
}

async function loadCarsForItems(items) {
  const carIds = items.map((item) => item.car);
  const cars = await Car.find({ _id: { $in: carIds } }).lean();

  const carMap = new Map(cars.map((car) => [String(car._id), car]));

  return items.map((item) => {
    const car = carMap.get(String(item.car));

    if (!car) {
      throw new AppError("One or more selected cars were not found", 404);
    }

    return {
      car,
      quantity: item.quantity,
    };
  });
}

function buildOrderItems(carItems) {
  return carItems.map(({ car, quantity }) => {
    const salePrice = resolveCarPrice(car);
    const subtotal = salePrice * quantity;

    return {
      car: car._id,
      carName: resolveCarName(car),
      carImage: resolveCarImage(car),
      salePrice: salePrice,
      quantity,
      subtotal,
    };
  });
}

function buildOrderQuery({ role, userId, filters = {} }) {
  const query = {};

  if (role !== "admin") {
    query["customer.user"] = userId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.payment_status) {
    query.paymentStatus = filters.paymentStatus;
  }

  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  if (filters.cancelRequestStatus) {
    query["cancel_request.status"] = filters.cancelRequestStatus;
  }

  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) {
      query.createdAt.$gte = new Date(filters.from);
    }
    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = toDate;
    }
  }

  if (filters.search) {
    const search = String(filters.search).trim();
    query.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "customer.name": { $regex: search, $options: "i" } },
      { "customer.email": { $regex: search, $options: "i" } },
      { "customer.phone": { $regex: search, $options: "i" } },
      { "shippingInfo.name": { $regex: search, $options: "i" } },
      { "shippingInfo.phone": { $regex: search, $options: "i" } },
      { "shippingInfo.address": { $regex: search, $options: "i" } },
      { "items.carName": { $regex: search, $options: "i" } },
    ];
  }

  return query;
}

function buildSort(sortBy = "createdAt", sortOrder = "desc") {
  return {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };
}

async function adjustCarStock(items, direction) {
  for (const item of items) {
    const quantity = Number(item.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new AppError("Invalid quantity", 400);
    }

    if (direction === "decrement") {
      const result = await Car.updateOne(
        {
          _id: item.car,
          stock: { $gte: quantity },
        },
        {
          $inc: { stock: -quantity },
        },
      );

      if (result.matchedCount === 0 || result.modifiedCount === 0) {
        throw new AppError(
          `Insufficient stock for car ${item.carName || item.car}`,
          400,
        );
      }

      continue;
    }

    if (direction === "increment") {
      await Car.updateOne(
        { _id: item.car },
        {
          $inc: { stock: quantity },
        },
      );
    }
  }
}

exports.createOrder = async ({ user, body }) => {
  const customer = resolveCustomer(user);
  const shippingInfo = resolveShippingInfo(body);
  const normalizedItems = normalizeItems(body.items);
  const carItems = await loadCarsForItems(normalizedItems);
  const orderItems = buildOrderItems(carItems);

  const subtotalAmount = orderItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );
  const shippingFee = Number(body.shippingFee || body.shipping_fee || 0);
  const totalAmount =
    subtotalAmount +
    (Number.isFinite(shippingFee) && shippingFee > 0 ? shippingFee : 0);

  const payload = {
    orderNumber: generateOrderNumber(),
    customer,
    shippingInfo: shippingInfo,
    items: orderItems,
    subtotalAmount: subtotalAmount,
    shippingFee:
      Number.isFinite(shippingFee) && shippingFee > 0 ? shippingFee : 0,
    totalAmount: totalAmount,
    status: "pending",
    paymentMethod: "cod",
    paymentStatus: "pending",
    inventory_adjustment: "none",
    note: body.note ? String(body.note).trim() : "",
  };

  return orderRepository.createOrder(payload);
};

exports.listOrders = async ({ role = "customer", userId, filters = {} }) => {
  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 10);
  const sort = buildSort(filters.sortBy, filters.sortOrder);
  const query = buildOrderQuery({ role, userId, filters });

  const [orders, total] = await Promise.all([
    orderRepository.findOrders({
      filter: query,
      sort,
      page,
      limit,
    }),
    orderRepository.countOrders(query),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

exports.getOrderById = async ({ orderId, userId, isAdmin = false }) => {
  const order = await orderRepository.findOrderById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (
    !isAdmin &&
    String(order.customer?.user?._id || order.customer?.user) !== String(userId)
  ) {
    throw new AppError("You are not authorized to view this order", 403);
  }

  return order;
};

exports.updateOrderStatus = async ({ orderId, status }) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new AppError("Invalid order status", 400);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.status === status) {
    return order;
  }

  if (order.status === "cancelled") {
    throw new AppError("Cancelled orders cannot be updated", 400);
  }

  if (
    ["confirmed", "preparing", "shipping", "delivered"].includes(status) &&
    order.inventory_adjustment !== "deducted"
  ) {
    await adjustCarStock(order.items, "decrement");

    order.inventory_adjustment = "deducted";
    order.confirmed_at = order.confirmed_at || new Date();
  }

  if (status === "cancelled" && order.inventory_adjustment === "deducted") {
    await adjustCarStock(order.items, "increment");

    order.inventory_adjustment = "restored";
    order.cancelled_at = new Date();
  }

  if (status === "preparing" || status === "shipping") {
    order.confirmed_at = order.confirmed_at || new Date();
  }

  if (status === "delivered") {
    order.delivered_at = new Date();
  }

  if (status === "cancelled" && order.inventory_adjustment !== "deducted") {
    order.cancelled_at = new Date();
  }

  order.status = status;

  return order.save();
};

exports.requestCancelOrder = async ({ orderId, userId, reason = "" }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (String(order.customer?.user) !== String(userId)) {
    throw new AppError("You are not authorized to cancel this order", 403);
  }

  if (order.status === "cancelled") {
    throw new AppError("Order is already cancelled", 400);
  }

  if (order.status === "delivered") {
    throw new AppError("Delivered orders cannot be cancelled", 400);
  }

  if (order.status === "pending") {
    order.status = "cancelled";
    order.cancelled_at = new Date();
    order.cancel_request = {
      status: "approved",
      reason: reason ? String(reason).trim() : "",
      requested_at: new Date(),
      reviewed_at: new Date(),
      reviewed_by: null,
      admin_note: "Customer cancelled before confirmation",
    };

    return order.save();
  }

  if (order.cancel_request?.status === "pending") {
    throw new AppError("Cancel request is already pending", 400);
  }

  order.cancel_request = {
    status: "pending",
    reason: reason ? String(reason).trim() : "",
    requested_at: new Date(),
    reviewed_at: null,
    reviewed_by: null,
    admin_note: "",
  };

  return order.save();
};

exports.reviewCancelRequest = async ({
  orderId,
  action,
  adminId,
  adminNote = "",
}) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.cancel_request?.status !== "pending") {
    throw new AppError("No pending cancel request for this order", 400);
  }

  order.cancel_request.reviewed_at = new Date();
  order.cancel_request.reviewed_by = adminId || null;
  order.cancel_request.admin_note = adminNote ? String(adminNote).trim() : "";

  if (action === "approve") {
    if (order.inventory_adjustment === "deducted") {
      await adjustCarStock(order.items, "increment");
      order.inventory_adjustment = "restored";
    }

    order.status = "cancelled";
    order.cancelled_at = new Date();
    order.cancel_request.status = "approved";

    return order.save();
  }

  order.cancel_request.status = "rejected";
  return order.save();
};
