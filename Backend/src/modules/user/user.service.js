const userRepository = require('./user.repository');
const AppError = require('../../shared/errors/AppError');

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    // Prevent updating sensitive fields via this route
    if (updateData.password || updateData.role || updateData.email) {
      throw new AppError('This route is not for password, email, or role updates.', 400);
    }

    const updatedUser = await userRepository.updateById(userId, updateData);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }
    
    return updatedUser;
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCorrect = await user.correctPassword(currentPassword, user.password);
    if (!isCorrect) {
      throw new AppError('Incorrect current password', 401);
    }

    user.password = newPassword;
    await user.save();
    return user;
  }

  async getAllUsers() {
    return await userRepository.findAll();
  }

  async updateUser(userId, updateData) {
    const user = await userRepository.updateById(userId, updateData);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async deleteUser(userId) {
    const user = await userRepository.deleteById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

module.exports = new UserService();
