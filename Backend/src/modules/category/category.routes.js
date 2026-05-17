const express = require('express');
const categoryController = require('./category.controller');
const { protect, restrictTo } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', categoryController.createCategory);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
