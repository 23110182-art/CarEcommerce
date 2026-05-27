const express = require("express");
const orderController = require("./order.controller");
const authMiddleware = require("../../shared/middleware/auth.middleware");

const router = express.Router();

const protect =
  authMiddleware.protect ||
  authMiddleware.authenticate ||
  authMiddleware.verifyToken ||
  ((req, res, next) => next());

const restrictTo =
  authMiddleware.restrictTo ||
  authMiddleware.authorizeRoles ||
  authMiddleware.authorize ||
  (() => (req, res, next) => next());

router.post("/", protect, orderController.createOrder);
router.get("/", protect, orderController.getMyOrders);
router.get("/:id", protect, orderController.getOrderById);
router.post("/:id/cancel", protect, orderController.requestCancelOrder);
router.patch(
  "/:id/status",
  protect,
  restrictTo("admin"),
  orderController.updateOrderStatus,
);
router.patch(
  "/:id/cancel-request",
  protect,
  restrictTo("admin"),
  orderController.reviewCancelRequest,
);

module.exports = router;
