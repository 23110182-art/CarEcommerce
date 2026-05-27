const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    carName: {
      type: String,
      required: true,
      trim: true,
    },
    carImage: {
      type: String,
      default: null,
      trim: true,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const CustomerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const ShippingInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customer: {
      type: CustomerSchema,
      required: true,
    },
    shippingInfo: {
      type: ShippingInfoSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Order must contain at least one item",
      },
      required: true,
    },
    subtotalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "shipping",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    inventory_adjustment: {
      type: String,
      enum: ["none", "deducted", "restored"],
      default: "none",
      index: true,
    },
    confirmed_at: {
      type: Date,
      default: null,
    },
    cancelled_at: {
      type: Date,
      default: null,
    },
    cancel_request: {
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
        index: true,
      },
      reason: {
        type: String,
        default: "",
        trim: true,
      },
      requested_at: {
        type: Date,
        default: null,
      },
      reviewed_at: {
        type: Date,
        default: null,
      },
      reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      admin_note: {
        type: String,
        default: "",
        trim: true,
      },
    },
    delivered_at: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

OrderSchema.index({ "customer.user": 1, createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);
