const promotionRepository = require('./promotion.repository');
const AppError = require('../../shared/errors/AppError');

class PromotionService {
  async createPromotion(data) {
    return await promotionRepository.create(data);
  }

  async getPromotion(id) {
    const promotion = await promotionRepository.findById(id);
    if (!promotion) {
      throw new AppError('Promotion not found', 404);
    }
    return promotion;
  }

  async updatePromotion(id, data) {
    const updated = await promotionRepository.updateById(id, data);
    if (!updated) {
      throw new AppError('Promotion not found', 404);
    }
    return updated;
  }

  async deletePromotion(id) {
    const deleted = await promotionRepository.deleteById(id);
    if (!deleted) {
      throw new AppError('Promotion not found', 404);
    }
    return deleted;
  }

  async getAllPromotions() {
    return await promotionRepository.findAll();
  }

  async getActivePromotions() {
    return await promotionRepository.findActivePromotions();
  }

  /**
   * Calculates the best promotion discount for a given car.
   * @param {Object} car - The car document
   * @param {Array} activePromotions - List of active promotions
   * @returns {Object|null} - Discount details or null
   */
  calculateDiscountForCar(car, activePromotions) {
    if (!activePromotions || activePromotions.length === 0) return null;

    const carIdStr = car._id.toString();
    const brandIdStr = car.brand_id?._id ? car.brand_id._id.toString() : car.brand_id?.toString();
    const categoryIdStr = car.category_id?._id ? car.category_id._id.toString() : car.category_id?.toString();

    let bestPromo = null;
    let maxDiscountAmount = 0;

    for (const promo of activePromotions) {
      let applies = false;

      if (promo.apply_to === 'all') {
        applies = true;
      } else if (promo.apply_to === 'brand' && brandIdStr) {
        applies = promo.applicable_brands.some(id => id.toString() === brandIdStr);
      } else if (promo.apply_to === 'category' && categoryIdStr) {
        applies = promo.applicable_categories.some(id => id.toString() === categoryIdStr);
      } else if (promo.apply_to === 'specific_cars' && carIdStr) {
        applies = promo.applicable_cars.some(id => id.toString() === carIdStr);
      }

      if (applies) {
        let discountAmount = 0;
        if (promo.discount_type === 'percentage') {
          discountAmount = car.price * (promo.discount_value / 100);
        } else if (promo.discount_type === 'amount') {
          discountAmount = promo.discount_value;
        }

        if (discountAmount > maxDiscountAmount) {
          maxDiscountAmount = discountAmount;
          bestPromo = promo;
        }
      }
    }

    if (bestPromo) {
      return {
        sale_price: Math.max(0, car.price - maxDiscountAmount),
        applied_promotion: {
          _id: bestPromo._id,
          name: bestPromo.name,
          description: bestPromo.description,
          discount_type: bestPromo.discount_type,
          discount_value: bestPromo.discount_value,
          end_date: bestPromo.end_date,
        }
      };
    }

    return null;
  }
}

module.exports = new PromotionService();
