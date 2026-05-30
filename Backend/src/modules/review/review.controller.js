const asyncHandler = require("../../shared/utils/asyncHandler");
const ApiResponse = require("../../shared/response/ApiResponse");
const AppError = require("../../shared/errors/AppError");
const ReviewService = require("./review.service");
const { createReviewSchema } = require("./review.validation");

const validate = (schema, data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  return value;
};

const createReview = asyncHandler(async (req, res) => {
  const validData = validate(createReviewSchema, req.body);
  const { productId, rating, comment } = validData;
  const userId = req.user._id; // User ID from authenticated user

  const review = await ReviewService.createReview(
    userId,
    productId,
    rating,
    comment,
  );
  res
    .status(201)
    .json(new ApiResponse(201, review, "Review created successfully"));
});

const getReviewsByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const reviews = await ReviewService.getReviewsByProductId(productId);
  // Transform reviews to include proper user object structure
  const transformedReviews = reviews.map((review) => ({
    _id: review._id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    user: review.user
      ? {
          _id: review.user._id,
          name: review.user.name,
          avatar: review.user.avatar,
        }
      : { _id: null, name: "Khách hàng ẩn danh", avatar: "" },
    rewardCoupon: review.rewardCoupon,
    rewardPoints: review.rewardPoints,
  }));
  res
    .status(200)
    .json(
      new ApiResponse(200, transformedReviews, "Reviews fetched successfully"),
    );
});

module.exports = {
  createReview,
  getReviewsByProductId,
};
