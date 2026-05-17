const brandService = require('./brand.service');
const ApiResponse = require('../../shared/response/ApiResponse');
const asyncHandler = require('../../shared/utils/asyncHandler');
const AppError = require('../../shared/errors/AppError');
const { createBrandSchema, updateBrandSchema } = require('./brand.validation');

const validate = (schema, data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  return value;
};

class BrandController {
  createBrand = asyncHandler(async (req, res, next) => {
    const validData = validate(createBrandSchema, req.body);
    const brand = await brandService.createBrand(validData);
    res.status(201).json(new ApiResponse(201, brand, 'Brand created successfully'));
  });

  getAllBrands = asyncHandler(async (req, res, next) => {
    const brands = await brandService.getAllBrands();
    res.status(200).json(new ApiResponse(200, brands, 'Brands fetched successfully'));
  });

  getBrand = asyncHandler(async (req, res, next) => {
    const brand = await brandService.getBrandByIdOrSlug(req.params.id);
    res.status(200).json(new ApiResponse(200, brand, 'Brand fetched successfully'));
  });

  updateBrand = asyncHandler(async (req, res, next) => {
    const validData = validate(updateBrandSchema, req.body);
    const brand = await brandService.updateBrand(req.params.id, validData);
    res.status(200).json(new ApiResponse(200, brand, 'Brand updated successfully'));
  });

  deleteBrand = asyncHandler(async (req, res, next) => {
    await brandService.deleteBrand(req.params.id);
    res.status(204).json(new ApiResponse(204, null, 'Brand deleted successfully'));
  });
}

module.exports = new BrandController();
