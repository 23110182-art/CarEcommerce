const express = require('express');
const carController = require('./car.controller');
const { protect, restrictTo } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Homepage Special APIs
router.get('/featured', carController.getFeaturedCars);
router.get('/newest', carController.getNewestCars);
router.get('/best-sellers', carController.getBestSellerCars);

// Public routes (Search, Filter, Detail)
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCar);

// Protected routes (Admin only for CRUD)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', carController.createCar);
router.patch('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

module.exports = router;
