const Brand = require('./brand.model');

class BrandRepository {
  async create(data) {
    return await Brand.create(data);
  }

  async findAll(query = {}) {
    return await Brand.find(query).sort('-createdAt');
  }

  async findByIdOrSlug(idOrSlug) {
    const mongoose = require('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    return await Brand.findOne(query);
  }

  async updateById(id, data) {
    // We use findById and save() instead of findByIdAndUpdate to trigger the pre-save hook for slug generation
    const brand = await Brand.findById(id);
    if (!brand) return null;
    
    Object.assign(brand, data);
    return await brand.save();
  }

  async deleteById(id) {
    return await Brand.findByIdAndDelete(id);
  }
}

module.exports = new BrandRepository();
