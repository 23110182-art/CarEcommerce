const express = require('express');
const brandController = require('./brand.controller');
const { protect, restrictTo } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrand);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', brandController.createBrand);
router.patch('/:id', brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

module.exports = router;
