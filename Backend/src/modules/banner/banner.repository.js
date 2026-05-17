const Banner = require('./banner.model');

class BannerRepository {
  async create(data) {
    return await Banner.create(data);
  }

  async findAll(query = {}) {
    return await Banner.find(query).sort('-createdAt');
  }

  async findById(id) {
    return await Banner.findById(id);
  }

  async updateById(id, data) {
    return await Banner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return await Banner.findByIdAndDelete(id);
  }
}

module.exports = new BannerRepository();
