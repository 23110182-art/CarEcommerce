const express = require('express');
const uploadController = require('./upload.controller');
const { protect, restrictTo } = require('../../shared/middleware/auth.middleware');
const { upload } = require('../../shared/lib/cloudinary');

const router = express.Router();

// Graceful upload error handler wrapper
const handleUploadError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

// Require authentication and admin role to upload files
router.use(protect);
router.use(restrictTo('admin'));

// 'image' and 'images' are the field names in the form-data request
router.post('/single', handleUploadError(upload.single('image')), uploadController.uploadSingle);
router.post('/multiple', handleUploadError(upload.array('images', 10)), uploadController.uploadMultiple); // max 10 images

module.exports = router;
