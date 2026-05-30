const Coupon = require('./coupon.model');

class CouponRepository {
  async create(couponData) {
    return Coupon.create(couponData);
  }

  async findByCode(code) {
    return Coupon.findOne({ code: code.toUpperCase(), isActive: true }).lean();
  }

  async findActiveCoupons() {
    return Coupon.find({ isActive: true, expiryDate: { $gte: new Date() } }).lean();
  }

  async incrementUsedCount(id) {
    return Coupon.findByIdAndUpdate(id, { $inc: { usedCount: 1 } }, { new: true }).lean();
  }
}

module.exports = new CouponRepository();