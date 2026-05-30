const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const userRepository = require("../../modules/user/user.repository");
const AppError = require("../errors/AppError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  // 1. Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401),
    );
  }
  try {
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_ACCESS_SECRET,
    );

    const currentUser = await userRepository.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401,
        ),
      );
    }

    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }

    if (err.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }

    return next(err);
  }
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'user']. req.user.role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
