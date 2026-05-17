const ApiResponse = require('../../shared/response/ApiResponse');
const asyncHandler = require('../../shared/utils/asyncHandler');
const AppError = require('../../shared/errors/AppError');

class UploadController {
  // Handle single file upload (e.g., logo, avatar, thumbnail)
  uploadSingle = asyncHandler(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    res.status(200).json(
      new ApiResponse(200, { url: req.file.path }, 'File uploaded successfully')
    );
  });

  // Handle multiple files upload (e.g., car images)
  uploadMultiple = asyncHandler(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('Please upload at least one file', 400));
    }

    // Map through req.files to extract URLs
    const urls = req.files.map(file => file.path);

    res.status(200).json(
      new ApiResponse(200, { urls }, 'Files uploaded successfully')
    );
  });
}

module.exports = new UploadController();
