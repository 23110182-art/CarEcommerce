const User = require("./user.model");

class UserRepository {
  async create(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select("+password");
  }

  async findByEmailWithOtp(email) {
    return await User.findOne({ email }).select("+otp +otpExpires");
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByIdWithPassword(id) {
    return await User.findById(id).select("+password");
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async findAll() {
    return await User.find().sort("-createdAt");
  }

  async deleteById(id) {
    return await User.findByIdAndDelete(id);
  }

  async addViewedProduct(userId, productId) {
    const user = await User.findById(userId);
    if (!user) return null;
    if (!user.viewedProducts.includes(productId)) {
      user.viewedProducts.push(productId);
      if (user.viewedProducts.length > 10) {
        user.viewedProducts.shift(); // Keep only last 10 viewed products
      }
      await user.save();
    }
    return user;
  }

  async getViewedProducts(userId) {
    const user = await User.findById(userId).populate({
      path: "viewedProducts",
      populate: {
        path: "brand",
        select: "name slug logo",
      },
    });
    return user ? user.viewedProducts.filter((item) => item !== null) : [];
  }

  async toggleWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) return null;
    const index = user.wishlist.findIndex(
      (id) => id.toString() === productId.toString(),
    );
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }
    await user.save();
    return user;
  }

  async getWishlist(userId) {
    const user = await User.findById(userId).populate({
      path: "wishlist",
      select: "_id name slug brand thumbnail price year color transmission",
      populate: {
        path: "brand",
        select: "name slug logo",
      },
    });
    if (!user) return [];
    const filtered = user.wishlist.filter((item) => item !== null);
    return filtered;
  }

  async addLoyaltyPoints(userId, points) {
    const user = await User.findById(userId);
    if (!user) return null;
    user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
    await user.save();
    return user;
  }
}

module.exports = new UserRepository();
