const ReviewRepository = require('./review.repository');
const CarRepository = require('../car/car.repository');
const AppError = require('../../shared/errors/AppError');

class ReviewService {
  async createReview(userId, productId, rating, comment) {
    const product = await CarRepository.findByIdOrSlug(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const existingReview = await ReviewRepository.findOne({ user: userId, product: product._id });
    if (existingReview) {
      throw new AppError('You have already reviewed this product', 400);
    }

    const review = await ReviewRepository.create({ user: userId, product: product._id, rating, comment });

    // Update product's average rating and total reviews
    const productReviews = await ReviewRepository.findByProductId(product._id);
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    product.averageRating = totalRating / productReviews.length;
    product.totalReviews = productReviews.length;
    await CarRepository.updateById(product._id, { averageRating: product.averageRating, totalReviews: product.totalReviews });

    // Reward user with loyalty points (e.g., 50 points per review) and a random coupon
    const UserRepository = require('../user/user.repository');
    const CouponRepository = require('../coupon/coupon.repository');
    await UserRepository.addLoyaltyPoints(userId, 50);

    // Create a 10% discount coupon for the user as a reward
    const uniqueCode = `REWARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days validity

    const coupon = await CouponRepository.create({
      code: uniqueCode,
      discountType: 'percentage',
      discountValue: 10,
      expiryDate,
      usageLimit: 1,
    });

    review.rewardCoupon = coupon.code;
    review.rewardPoints = 50;

    return review;
  }

  async getReviewsByProductId(productId) {
    const product = await CarRepository.findByIdOrSlug(productId);
    if (!product) return [];
    return ReviewRepository.findByProductId(product._id);
  }
}

module.exports = new ReviewService();