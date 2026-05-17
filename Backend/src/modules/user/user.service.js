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
}

module.exports = new UserService();
