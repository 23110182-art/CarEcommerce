const bannerService = require('./banner.service');
const ApiResponse = require('../../shared/response/ApiResponse');
const asyncHandler = require('../../shared/utils/asyncHandler');
const AppError = require('../../shared/errors/AppError');
const { createBannerSchema, updateBannerSchema } = require('./banner.validation');

const validate = (schema, data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  return value;
};

class BannerController {
  createBanner = asyncHandler(async (req, res, next) => {
    const validData = validate(createBannerSchema, req.body);
    const banner = await bannerService.createBanner(validData);
    res.status(201).json(new ApiResponse(201, banner, 'Banner created successfully'));
  });

  getAllBanners = asyncHandler(async (req, res, next) => {
    // If request has ?active=true, filter it
    const filter = req.query.active === 'true' ? { is_active: true } : {};
    const banners = await bannerService.getAllBanners(filter);
    res.status(200).json(new ApiResponse(200, banners, 'Banners fetched successfully'));
  });

  getBanner = asyncHandler(async (req, res, next) => {
    const banner = await bannerService.getBannerById(req.params.id);
    res.status(200).json(new ApiResponse(200, banner, 'Banner fetched successfully'));
  });

  updateBanner = asyncHandler(async (req, res, next) => {
    const validData = validate(updateBannerSchema, req.body);
    const banner = await bannerService.updateBanner(req.params.id, validData);
    res.status(200).json(new ApiResponse(200, banner, 'Banner updated successfully'));
  });

  deleteBanner = asyncHandler(async (req, res, next) => {
    await bannerService.deleteBanner(req.params.id);
    res.status(204).json(new ApiResponse(204, null, 'Banner deleted successfully'));
  });
}

module.exports = new BannerController();
