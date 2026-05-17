const authService = require('./auth.service');
const ApiResponse = require('../../shared/response/ApiResponse');
const asyncHandler = require('../../shared/utils/asyncHandler');
const AppError = require('../../shared/errors/AppError');

const { registerSchema, loginSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema } = require('./auth.validation');

const validate = (schema, data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  return value;
};

// Helper function to set cookie
const sendTokenResponse = (result, res, message) => {
  const { user, accessToken, refreshToken } = result;

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production', // uncomment in prod (requires HTTPS)
  };

  res.cookie('jwt_refresh', refreshToken, cookieOptions);

  res.status(200).json(new ApiResponse(200, { user, accessToken }, message));
};

class AuthController {
  register = asyncHandler(async (req, res, next) => {
    const validData = validate(registerSchema, req.body);
    const result = await authService.register(validData);
    res.status(200).json(new ApiResponse(200, result, 'Registration successful, check email for OTP'));
  });

  verifyOtp = asyncHandler(async (req, res, next) => {
    const validData = validate(verifyOtpSchema, req.body);
    const result = await authService.verifyOtp(validData.email, validData.otp);
    sendTokenResponse(result, res, 'OTP verified successfully');
  });

  login = asyncHandler(async (req, res, next) => {
    const validData = validate(loginSchema, req.body);
    const result = await authService.login(validData.email, validData.password);
    sendTokenResponse(result, res, 'Login successful');
  });

  logout = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.jwt_refresh;
    // req.user might not be available here depending on routes, let's extract user id from token
    if (refreshToken) {
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.decode(refreshToken); // just decode to get ID
        if (decoded && decoded.id) {
          await authService.logout(decoded.id, refreshToken);
        }
      } catch (err) {
        // ignore invalid tokens during logout
      }
    }

    res.cookie('jwt_refresh', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  });

  refreshToken = asyncHandler(async (req, res, next) => {
    const oldRefreshToken = req.cookies.jwt_refresh;
    if (!oldRefreshToken) {
      return next(new AppError('No refresh token provided. Please log in again.', 401));
    }

    const result = await authService.refreshToken(oldRefreshToken);
    sendTokenResponse(result, res, 'Token refreshed successfully');
  });

  forgotPassword = asyncHandler(async (req, res, next) => {
    const validData = validate(forgotPasswordSchema, req.body);
    const result = await authService.forgotPassword(validData.email);
    res.status(200).json(new ApiResponse(200, result, 'OTP sent to email'));
  });

  resetPassword = asyncHandler(async (req, res, next) => {
    const validData = validate(resetPasswordSchema, req.body);
    const result = await authService.resetPassword(validData.email, validData.otp, validData.newPassword);
    res.status(200).json(new ApiResponse(200, result, result.message));
  });
}

module.exports = new AuthController();
