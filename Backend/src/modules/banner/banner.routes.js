const express = require('express');
const bannerController = require('./banner.controller');
const { protect, restrictTo } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBanner);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', bannerController.createBanner);
router.patch('/:id', bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
