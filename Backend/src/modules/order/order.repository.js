const Order = require("./order.model");

const DEFAULT_POPULATE = [
  { path: "customer.user", select: "name email phone role" },
  { path: "items.car", select: "name price stock images status" },
];

function applyPopulate(query, populate = DEFAULT_POPULATE) {
  if (!populate || !Array.isArray(populate)) {
    return query;
  }

  populate.forEach((item) => {
    query.populate(item);
  });

  return query;
}

exports.createOrder = async (payload, options = {}) => {
  const created = await Order.create([payload], options);
  return created[0];
};

exports.findOrderById = async (orderId, options = {}) => {
  const query = Order.findById(orderId);
  applyPopulate(query, options.populate);
  if (options.session) {
    query.session(options.session);
  }
  return query;
};

exports.findOrderByIdLean = async (orderId, options = {}) => {
  const query = Order.findById(orderId);
  applyPopulate(query, options.populate);
  if (options.session) {
    query.session(options.session);
  }
  return query.lean();
};

exports.findOrderByIdAndUpdate = async (orderId, update, options = {}) => {
  const query = Order.findByIdAndUpdate(orderId, update, {
    new: true,
    runValidators: true,
  });

  applyPopulate(query, options.populate);

  if (options.session) {
    query.session(options.session);
  }

  return query;
};

exports.findOrders = async ({
  filter = {},
  sort = { createdAt: -1 },
  page = 1,
  limit = 10,
  populate = DEFAULT_POPULATE,
  session,
} = {}) => {
  const query = Order.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
  applyPopulate(query, populate);
  if (session) {
    query.session(session);
  }
  return query;
};

exports.countOrders = async (filter = {}) => Order.countDocuments(filter);
