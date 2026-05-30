const express = require("express");
const userController = require("./user.controller");
const {
  protect,
  restrictTo,
} = require("../../shared/middleware/auth.middleware");

const router = express.Router();

router.use(protect);

// Profile
router.get("/profile", userController.getMe);
router.put("/profile", userController.updateMe);
router.patch("/profile/password", userController.updateMyPassword);

// Viewed Products
router.post("/viewed-products", userController.addViewedProduct);

router.get("/viewed-products", userController.getViewedProducts);

// Wishlist
router.post("/wishlist", userController.toggleWishlist);

router.get("/wishlist", userController.getWishlist);

// Admin
router.get("/", restrictTo("admin"), userController.getAllUsers);

router.patch("/:id", restrictTo("admin"), userController.updateUser);

router.delete("/:id", restrictTo("admin"), userController.deleteUser);

module.exports = router;
