const brandRepository = require('./brand.repository');
const AppError = require('../../shared/errors/AppError');
const { deleteFromCloudinary } = require('../../shared/lib/cloudinary');

class BrandService {
  async createBrand(data) {
    return await brandRepository.create(data);
  }

  async getAllBrands() {
    return await brandRepository.findAll();
  }

  async getBrandByIdOrSlug(idOrSlug) {
    const brand = await brandRepository.findByIdOrSlug(idOrSlug);
    if (!brand) {
      throw new AppError('No brand found with that ID or Slug', 404);
    }
    return brand;
  }

  async updateBrand(id, data) {
    const brand = await brandRepository.updateById(id, data);
    if (!brand) {
      throw new AppError('No brand found with that ID', 404);
    }
    return brand;
  }

  async deleteBrand(id) {
    const brand = await brandRepository.deleteById(id);
    if (!brand) {
      throw new AppError('No brand found with that ID', 404);
    }
    
    // Automatically delete brand logo from Cloudinary
    if (brand.logo) {
      await deleteFromCloudinary(brand.logo);
    }
    
    return null;
  }
}

module.exports = new BrandService();
