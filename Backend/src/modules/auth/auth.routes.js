const express = require('express');
const authController = require('./auth.controller');

const {
    loginLimiter,
    registerLimiter,
    verifyOtpLimiter,
    forgotPasswordLimiter,
} = require('../../shared/middleware/rateLimiter');

const router = express.Router();

// router.post('/register', registerLimiter, authController.register);
// router.post('/verify-otp', verifyOtpLimiter, authController.verifyOtp);
// router.post('/login', loginLimiter, authController.login);
// router.post('/logout', authController.logout);
// router.post('/refresh-token', authController.refreshToken);
// router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
// router.post('/reset-password', forgotPasswordLimiter, authController.resetPassword);



router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;