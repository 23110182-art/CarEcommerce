const userService = require('./user.service');
const ApiResponse = require('../../shared/response/ApiResponse');
const asyncHandler = require('../../shared/utils/asyncHandler');

class UserController {
  getMe = asyncHandler(async (req, res, next) => {
    // req.user is set by protect middleware
    const user = await userService.getProfile(req.user._id);
    res.status(200).json(new ApiResponse(200, user, 'User profile fetched successfully'));
  });

  updateMe = asyncHandler(async (req, res, next) => {
    // We only allow name update for now as an example of edit profile
    const filteredBody = {
      name: req.body.name,
    };
    
    const updatedUser = await userService.updateProfile(req.user._id, filteredBody);
    res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
  });
}

module.exports = new UserController();
