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

// Similar products & stats
router.get('/:id/similar', async (req, res, next) => {
  try {
    const CarRepository = require('./car.repository');
    const products = await CarRepository.findSimilar(req.params.id);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/stats', async (req, res, next) => {
  try {
    const CarRepository = require('./car.repository');
    const stats = await CarRepository.getStats(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// Protected routes (Admin only for CRUD)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', carController.createCar);
router.patch('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

module.exports = router;
