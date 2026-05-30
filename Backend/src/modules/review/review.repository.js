const Review = require("./review.model");

class ReviewRepository {
  async create(reviewData) {
    return Review.create(reviewData);
  }

  async findByProductId(productId) {
    return Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort("-createdAt")
      .lean();
  }

  async findOne(query) {
    return Review.findOne(query).lean();
  }

  async update(query, updateData) {
    return Review.findOneAndUpdate(query, updateData, { new: true }).lean();
  }

  async delete(query) {
    return Review.findOneAndDelete(query).lean();
  }
}

module.exports = new ReviewRepository();
