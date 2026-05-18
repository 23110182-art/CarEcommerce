const Promotion = require('./promotion.model');

class PromotionRepository {
  async create(data) {
    return await Promotion.create(data);
  }

  async findById(id) {
    return await Promotion.findById(id)
      .populate('applicable_brands', 'name')
      .populate('applicable_categories', 'name')
      .populate('applicable_cars', 'name');
  }

  async updateById(id, data) {
    return await Promotion.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate('applicable_brands', 'name')
      .populate('applicable_categories', 'name')
      .populate('applicable_cars', 'name');
  }

  async deleteById(id) {
    return await Promotion.findByIdAndDelete(id);
  }

  async findAll() {
    return await Promotion.find()
      .populate('applicable_brands', 'name')
      .populate('applicable_categories', 'name')
      .populate('applicable_cars', 'name')
      .sort('-createdAt');
  }

  async findActivePromotions() {
    const now = new Date();
    return await Promotion.find({
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
    });
  }
}

module.exports = new PromotionRepository();
