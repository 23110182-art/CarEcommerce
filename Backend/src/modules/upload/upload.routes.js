const express = require('express');
const uploadController = require('./upload.controller');
const { protect, restrictTo } = require('../../shared/middleware/auth.middleware');
const { upload } = require('../../shared/lib/cloudinary');

const router = express.Router();

// Require authentication and admin role to upload files
router.use(protect);
router.use(restrictTo('admin'));

// 'image' and 'images' are the field names in the form-data request
router.post('/single', upload.single('image'), uploadController.uploadSingle);
router.post('/multiple', upload.array('images', 10), uploadController.uploadMultiple); // max 10 images

module.exports = router;
