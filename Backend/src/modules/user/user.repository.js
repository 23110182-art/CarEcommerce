const User = require('./user.model');

class UserRepository {
  async create(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findByEmailWithOtp(email) {
    return await User.findOne({ email }).select('+otp +otpExpires');
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByIdWithPassword(id) {
    return await User.findById(id).select('+password');
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async findAll() {
    return await User.find().sort('-createdAt');
  }

  async deleteById(id) {
    return await User.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();
