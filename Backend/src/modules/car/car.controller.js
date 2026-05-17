const carService = require('./car.service');
const ApiResponse = require('../../shared/response/ApiResponse');
const asyncHandler = require('../../shared/utils/asyncHandler');
const AppError = require('../../shared/errors/AppError');
const { createCarSchema, updateCarSchema } = require('./car.validation');

const validate = (schema, data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  return value;
};

class CarController {
  createCar = asyncHandler(async (req, res, next) => {
    const validData = validate(createCarSchema, req.body);
    const car = await carService.createCar(validData);
    res.status(201).json(new ApiResponse(201, car, 'Car created successfully'));
  });

  getAllCars = asyncHandler(async (req, res, next) => {
    const result = await carService.getAllCars(req.query);
    res.status(200).json(new ApiResponse(200, result, 'Cars fetched successfully'));
  });

  getCar = asyncHandler(async (req, res, next) => {
    const car = await carService.getCarByIdOrSlug(req.params.id);
    res.status(200).json(new ApiResponse(200, car, 'Car details fetched successfully'));
  });

  updateCar = asyncHandler(async (req, res, next) => {
    const validData = validate(updateCarSchema, req.body);
    const car = await carService.updateCar(req.params.id, validData);
    res.status(200).json(new ApiResponse(200, car, 'Car updated successfully'));
  });

  deleteCar = asyncHandler(async (req, res, next) => {
    await carService.deleteCar(req.params.id);
    res.status(204).json(new ApiResponse(204, null, 'Car deleted successfully'));
  });

  // Homepage APIs
  getFeaturedCars = asyncHandler(async (req, res, next) => {
    const result = await carService.getFeaturedCars();
    res.status(200).json(new ApiResponse(200, result.cars, 'Featured cars fetched successfully'));
  });

  getNewestCars = asyncHandler(async (req, res, next) => {
    const result = await carService.getNewestCars();
    res.status(200).json(new ApiResponse(200, result.cars, 'Newest cars fetched successfully'));
  });

  getBestSellerCars = asyncHandler(async (req, res, next) => {
    const result = await carService.getBestSellerCars();
    res.status(200).json(new ApiResponse(200, result.cars, 'Best seller cars fetched successfully'));
  });
}

module.exports = new CarController();
