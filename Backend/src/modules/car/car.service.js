const carRepository = require('./car.repository');
const AppError = require('../../shared/errors/AppError');
const { deleteFromCloudinary } = require('../../shared/lib/cloudinary');

class CarService {
  async _applyPromotionsToCarsResult(result) {
    const promotionService = require('../promotion/promotion.service');
    const activePromotions = await promotionService.getActivePromotions();
    result.cars = result.cars.map(car => {
      const carObj = car.toObject ? car.toObject() : car;
      const discount = promotionService.calculateDiscountForCar(carObj, activePromotions);
      if (discount) {
        return { ...carObj, ...discount };
      }
      return carObj;
    });
    return result;
  }

  async _applyPromotionsToSingleCar(car) {
    if (!car) return null;
    const promotionService = require('../promotion/promotion.service');
    const activePromotions = await promotionService.getActivePromotions();
    const carObj = car.toObject ? car.toObject() : car;
    const discount = promotionService.calculateDiscountForCar(carObj, activePromotions);
    if (discount) {
      return { ...carObj, ...discount };
    }
    return carObj;
  }

  async createCar(data) {
    return await carRepository.create(data);
  }

  async getAllCars(query) {
    const result = await carRepository.findAllWithFilters(query);
    return await this._applyPromotionsToCarsResult(result);
  }

  async getCarByIdOrSlug(idOrSlug) {
    const car = await carRepository.findByIdOrSlug(idOrSlug);
    if (!car) {
      throw new AppError('No car found with that ID or Slug', 404);
    }
    return await this._applyPromotionsToSingleCar(car);
  }

  async updateCar(id, data) {
    const car = await carRepository.updateById(id, data);
    if (!car) {
      throw new AppError('No car found with that ID', 404);
    }
    return await this._applyPromotionsToSingleCar(car);
  }

  async deleteCar(id) {
    const car = await carRepository.deleteById(id);
    if (!car) {
      throw new AppError('No car found with that ID', 404);
    }
    
    // Automatically delete images from Cloudinary
    if (car.images && car.images.length > 0) {
      await Promise.all(car.images.map(image => deleteFromCloudinary(image)));
    }
    
    return null;
  }

  // Homepage specific getters (using the existing filter engine)
  async getFeaturedCars() {
    const result = await carRepository.findAllWithFilters({ is_featured: true, limit: 8 });
    return await this._applyPromotionsToCarsResult(result);
  }

  async getNewestCars() {
    const result = await carRepository.findAllWithFilters({ is_new: true, sort: 'newest', limit: 8 });
    return await this._applyPromotionsToCarsResult(result);
  }

  async getBestSellerCars() {
    const result = await carRepository.findAllWithFilters({ sort: 'best_selling', limit: 8 });
    return await this._applyPromotionsToCarsResult(result);
  }
}

module.exports = new CarService();
