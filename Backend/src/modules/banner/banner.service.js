const bannerRepository = require('./banner.repository');
const AppError = require('../../shared/errors/AppError');
const { deleteFromCloudinary } = require('../../shared/lib/cloudinary');

class BannerService {
  async createBanner(data) {
    return await bannerRepository.create(data);
  }

  async getAllBanners(query = {}) {
    // Frontend usually only needs active banners
    return await bannerRepository.findAll(query);
  }

  async getBannerById(id) {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('No banner found with that ID', 404);
    }
    return banner;
  }

  async updateBanner(id, data) {
    const banner = await bannerRepository.updateById(id, data);
    if (!banner) {
      throw new AppError('No banner found with that ID', 404);
    }
    return banner;
  }

  async deleteBanner(id) {
    const banner = await bannerRepository.deleteById(id);
    if (!banner) {
      throw new AppError('No banner found with that ID', 404);
    }
    
    // Automatically delete banner image from Cloudinary
    if (banner.image) {
      await deleteFromCloudinary(banner.image);
    }
    
    return null;
  }
}

module.exports = new BannerService();
