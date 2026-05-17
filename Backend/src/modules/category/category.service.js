const categoryRepository = require('./category.repository');
const AppError = require('../../shared/errors/AppError');

class CategoryService {
  async createCategory(data) {
    return await categoryRepository.create(data);
  }

  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryByIdOrSlug(idOrSlug) {
    const category = await categoryRepository.findByIdOrSlug(idOrSlug);
    if (!category) {
      throw new AppError('No category found with that ID or Slug', 404);
    }
    return category;
  }

  async updateCategory(id, data) {
    const category = await categoryRepository.updateById(id, data);
    if (!category) {
      throw new AppError('No category found with that ID', 404);
    }
    return category;
  }

  async deleteCategory(id) {
    const category = await categoryRepository.deleteById(id);
    if (!category) {
      throw new AppError('No category found with that ID', 404);
    }
    return null;
  }
}

module.exports = new CategoryService();
