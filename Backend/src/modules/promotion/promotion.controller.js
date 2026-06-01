const promotionService = require("./promotion.service");
const ApiResponse = require("../../shared/response/ApiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");

class PromotionController {
  createPromotion = asyncHandler(async (req, res, next) => {
    const promotion = await promotionService.createPromotion(req.body);
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          promotion,
          "Promotion campaign created successfully",
        ),
      );
  });

  getPromotion = asyncHandler(async (req, res, next) => {
    const promotion = await promotionService.getPromotion(req.params.id);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          promotion,
          "Promotion details fetched successfully",
        ),
      );
  });

  updatePromotion = asyncHandler(async (req, res, next) => {
    const promotion = await promotionService.updatePromotion(
      req.params.id,
      req.body,
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          promotion,
          "Promotion campaign updated successfully",
        ),
      );
  });

  deletePromotion = asyncHandler(async (req, res, next) => {
    await promotionService.deletePromotion(req.params.id);
    res
      .status(200)
      .json(
        new ApiResponse(200, null, "Promotion campaign deleted successfully"),
      );
  });

  getAllPromotions = asyncHandler(async (req, res, next) => {
    const promotions = await promotionService.getAllPromotions();
    res
      .status(200)
      .json(
        new ApiResponse(200, promotions, "All promotions fetched successfully"),
      );
  });

  calculateDiscountForCar = asyncHandler(async (req, res, next) => {
    const { carId } = req.params;
    const Car = require("../car/car.model");

    // Fetch car with brand and category populated
    const car = await Car.findById(carId)
      .populate("brand", "_id name slug")
      .populate("category", "_id name slug")
      .lean();

    if (!car) {
      return res.status(404).json(new ApiResponse(404, null, "Car not found"));
    }

    // Get active promotions
    const activePromotions = await promotionService.getActivePromotions();

    // Calculate best promotion for this car
    const promotionResult = promotionService.calculateDiscountForCar(
      car,
      activePromotions,
    );

    if (promotionResult) {
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            promotionResult,
            "Promotion calculated successfully",
          ),
        );
    } else {
      res
        .status(200)
        .json(new ApiResponse(200, null, "No applicable promotion found"));
    }
  });
}

module.exports = new PromotionController();
