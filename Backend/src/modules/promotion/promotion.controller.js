const promotionService = require('./promotion.service');
const ApiResponse = require('../../shared/response/ApiResponse');
const asyncHandler = require('../../shared/utils/asyncHandler');

class PromotionController {
  createPromotion = asyncHandler(async (req, res, next) => {
    const promotion = await promotionService.createPromotion(req.body);
    res.status(201).json(new ApiResponse(201, promotion, 'Promotion campaign created successfully'));
  });

  getPromotion = asyncHandler(async (req, res, next) => {
    const promotion = await promotionService.getPromotion(req.params.id);
    res.status(200).json(new ApiResponse(200, promotion, 'Promotion details fetched successfully'));
  });

  updatePromotion = asyncHandler(async (req, res, next) => {
    const promotion = await promotionService.updatePromotion(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, promotion, 'Promotion campaign updated successfully'));
  });

  deletePromotion = asyncHandler(async (req, res, next) => {
    await promotionService.deletePromotion(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Promotion campaign deleted successfully'));
  });

  getAllPromotions = asyncHandler(async (req, res, next) => {
    const promotions = await promotionService.getAllPromotions();
    res.status(200).json(new ApiResponse(200, promotions, 'All promotions fetched successfully'));
  });
}

module.exports = new PromotionController();
