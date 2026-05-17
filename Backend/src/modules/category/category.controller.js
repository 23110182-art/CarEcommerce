const categoryService = require('./category.service');
const ApiResponse = require('../../shared/response/ApiResponse');
const asyncHandler = require('../../shared/utils/asyncHandler');
const AppError = require('../../shared/errors/AppError');
const { createCategorySchema, updateCategorySchema } = require('./category.validation');

const validate = (schema, data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  return value;
};

class CategoryController {
  createCategory = asyncHandler(async (req, res, next) => {
    const validData = validate(createCategorySchema, req.body);
    const category = await categoryService.createCategory(validData);
    res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
  });

  getAllCategories = asyncHandler(async (req, res, next) => {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(new ApiResponse(200, categories, 'Categories fetched successfully'));
  });

  getCategory = asyncHandler(async (req, res, next) => {
    const category = await categoryService.getCategoryByIdOrSlug(req.params.id);
    res.status(200).json(new ApiResponse(200, category, 'Category fetched successfully'));
  });

  updateCategory = asyncHandler(async (req, res, next) => {
    const validData = validate(updateCategorySchema, req.body);
    const category = await categoryService.updateCategory(req.params.id, validData);
    res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
  });

  deleteCategory = asyncHandler(async (req, res, next) => {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).json(new ApiResponse(204, null, 'Category deleted successfully'));
  });
}

module.exports = new CategoryController();
