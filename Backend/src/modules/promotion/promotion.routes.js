const express = require("express");
const promotionController = require("./promotion.controller");
const {
  protect,
  restrictTo,
} = require("../../shared/middleware/auth.middleware");

const router = express.Router();

// Public / Authenticated user route to fetch all promotions
router.get("/", promotionController.getAllPromotions);
router.get("/calculate/:carId", promotionController.calculateDiscountForCar);
router.get("/:id", promotionController.getPromotion);

// Admin-only Promotion Management routes
router.use(protect);
router.use(restrictTo("admin"));

router.post("/", promotionController.createPromotion);
router.put("/:id", promotionController.updatePromotion);
router.delete("/:id", promotionController.deletePromotion);

module.exports = router;
