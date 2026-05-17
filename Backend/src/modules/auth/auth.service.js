const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const userRepository = require('../user/user.repository');
const AppError = require('../../shared/errors/AppError');
const sendEmail = require('../../shared/lib/mailer');
const { redisClient } = require('../../config/redis');

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

class AuthService {
  async createSendToken(user) {
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Save refresh token to Redis with 7 days TTL (in seconds)
    // Format: refreshToken:<userId>:<token>
    const ttlInSeconds = 7 * 24 * 60 * 60; // 7 days
    await redisClient.setEx(`refreshToken:${user._id}:${refreshToken}`, ttlInSeconds, 'valid');

    // Remove sensitive data from output
    user.password = undefined;
    user.otp = undefined;
    user.otpExpires = undefined;

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email is already in use', 400);
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    const user = await userRepository.create({
      ...userData,
      otp,
      otpExpires,
      isVerified: false,
    });

    try {
      const message = `Your OTP for Car Ecommerce registration is: ${otp}.\nIt is valid for 10 minutes.`;
      await sendEmail({
        email: user.email,
        subject: 'Registration OTP - Car Ecommerce',
        message,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new AppError('There was an error sending the OTP email. Try again later!', 500);
    }

    return {
      email: user.email,
      message: 'OTP sent to email. Please verify to complete registration.',
    };
  }

  async verifyOtp(email, otp) {
    const user = await userRepository.findByEmailWithOtp(email);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('User is already verified', 400);
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      throw new AppError('OTP is invalid or has expired', 400);
    }

    await userRepository.updateById(user._id, {
      isVerified: true,
      otp: undefined,
      otpExpires: undefined,
    });

    return await this.createSendToken(user);
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    if (!user.isVerified) {
      throw new AppError('Please verify your email before logging in', 401);
    }

    return await this.createSendToken(user);
  }

  async logout(userId, refreshToken) {
    // Xóa refresh token khỏi Redis
    await redisClient.del(`refreshToken:${userId}:${refreshToken}`);
    return { message: 'Logged out successfully' };
  }

  async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw new AppError('Refresh token is required', 401);
    }

    // 1. Verify token signature
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new AppError('Invalid refresh token. Please log in again!', 401);
    }

    const userId = decoded.id;

    // 2. Check if the token exists in Redis (Detect reuse/theft)
    const tokenExists = await redisClient.get(`refreshToken:${userId}:${oldRefreshToken}`);
    if (!tokenExists) {
      // Possible replay attack: token is valid but not in Redis. 
      // We should revoke all sessions to protect the user.
      const keys = await redisClient.keys(`refreshToken:${userId}:*`);
      if (keys.length > 0) {
        await redisClient.del(keys); // Delete all user's tokens
      }
      throw new AppError('Refresh token reused or revoked! All sessions terminated. Please log in again.', 401);
    }

    // 3. Delete old token from Redis (Rotation)
    await redisClient.del(`refreshToken:${userId}:${oldRefreshToken}`);

    // 4. Generate new tokens
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    return await this.createSendToken(user);
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('There is no user with that email address.', 404);
    }

    const otp = generateOTP();
    await userRepository.updateById(user._id, {
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
    });

    try {
      const message = `Forgot your password? Your OTP to reset password is: ${otp}.\nIt is valid for 10 minutes.`;
      await sendEmail({
        email: user.email,
        subject: 'Your password reset OTP (valid for 10 min)',
        message,
      });

      return { message: 'OTP sent to email!' };
    } catch (error) {
      await userRepository.updateById(user._id, {
        otp: undefined,
        otpExpires: undefined,
      });
      throw new AppError('There was an error sending the email. Try again later!', 500);
    }
  }

  async resetPassword(email, otp, newPassword) {
    const user = await userRepository.findByEmailWithOtp(email);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      throw new AppError('OTP is invalid or has expired', 400);
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Invalidate all current sessions (Logout from all devices)
    const keys = await redisClient.keys(`refreshToken:${user._id}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    return { message: 'Password reset successfully. Please log in with your new password.' };
  }
}

module.exports = new AuthService();
