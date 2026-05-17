const carRepository = require('./car.repository');
const AppError = require('../../shared/errors/AppError');

class CarService {
  async createCar(data) {
    return await carRepository.create(data);
  }

  async getAllCars(query) {
    return await carRepository.findAllWithFilters(query);
  }

  async getCarByIdOrSlug(idOrSlug) {
    const car = await carRepository.findByIdOrSlug(idOrSlug);
    if (!car) {
      throw new AppError('No car found with that ID or Slug', 404);
    }
    return car;
  }

  async updateCar(id, data) {
    const car = await carRepository.updateById(id, data);
    if (!car) {
      throw new AppError('No car found with that ID', 404);
    }
    return car;
  }

  async deleteCar(id) {
    const car = await carRepository.deleteById(id);
    if (!car) {
      throw new AppError('No car found with that ID', 404);
    }
    return null;
  }

  // Homepage specific getters (using the existing filter engine)
  async getFeaturedCars() {
    return await carRepository.findAllWithFilters({ is_featured: true, limit: 8 });
  }

  async getNewestCars() {
    return await carRepository.findAllWithFilters({ is_new: true, sort: 'newest', limit: 8 });
  }

  async getBestSellerCars() {
    return await carRepository.findAllWithFilters({ sort: 'best_selling', limit: 8 });
  }
}

module.exports = new CarService();
