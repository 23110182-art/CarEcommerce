const userService = require("./user.service");
const ApiResponse = require("../../shared/response/ApiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");
const AppError = require("../../shared/errors/AppError");

class UserController {
  getMe = asyncHandler(async (req, res, next) => {
    const user = await userService.getProfile(req.user._id);

    res
      .status(200)
      .json(new ApiResponse(200, user, "User profile fetched successfully"));
  });

  updateMe = asyncHandler(async (req, res, next) => {
    const filteredBody = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      avatar: req.body.avatar,
      dob: req.body.dob,
      gender: req.body.gender,
    };

    const updatedUser = await userService.updateProfile(
      req.user._id,
      filteredBody,
    );

    res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
  });

  updateMyPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new AppError("Please provide currentPassword and newPassword", 400),
      );
    }

    await userService.updatePassword(
      req.user._id,
      currentPassword,
      newPassword,
    );

    res
      .status(200)
      .json(new ApiResponse(200, null, "Password updated successfully"));
  });

  getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await userService.getAllUsers();

    res
      .status(200)
      .json(new ApiResponse(200, users, "Users fetched successfully"));
  });

  updateUser = asyncHandler(async (req, res, next) => {
    const updatedUser = await userService.updateUser(req.params.id, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User updated successfully"));
  });

  deleteUser = asyncHandler(async (req, res, next) => {
    await userService.deleteUser(req.params.id);

    res
      .status(200)
      .json(new ApiResponse(200, null, "User deleted successfully"));
  });

  // ===== Viewed Products =====

  addViewedProduct = asyncHandler(async (req, res, next) => {
    const user = await userService.addViewedProduct(
      req.user._id,
      req.body.productId,
    );

    res
      .status(200)
      .json(new ApiResponse(200, user, "Viewed product added successfully"));
  });

  getViewedProducts = asyncHandler(async (req, res, next) => {
    const products = await userService.getViewedProducts(req.user._id);

    res
      .status(200)
      .json(
        new ApiResponse(200, products, "Viewed products fetched successfully"),
      );
  });

  // ===== Wishlist =====

  toggleWishlist = asyncHandler(async (req, res, next) => {
    const user = await userService.toggleWishlist(
      req.user._id,
      req.body.productId,
    );

    res
      .status(200)
      .json(new ApiResponse(200, user, "Wishlist updated successfully"));
  });

  getWishlist = asyncHandler(async (req, res, next) => {
    const products = await userService.getWishlist(req.user._id);

    res
      .status(200)
      .json(new ApiResponse(200, products, "Wishlist fetched successfully"));
  });
}

module.exports = new UserController();
