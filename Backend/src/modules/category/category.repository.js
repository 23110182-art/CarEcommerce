const Category = require('./category.model');

class CategoryRepository {
  async create(data) {
    return await Category.create(data);
  }

  async findAll(query = {}) {
    return await Category.find(query).sort('-createdAt');
  }

  async findByIdOrSlug(idOrSlug) {
    const mongoose = require('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    return await Category.findOne(query);
  }

  async updateById(id, data) {
    const category = await Category.findById(id);
    if (!category) return null;
    
    Object.assign(category, data);
    return await category.save();
  }

  async deleteById(id) {
    return await Category.findByIdAndDelete(id);
  }
}

module.exports = new CategoryRepository();
