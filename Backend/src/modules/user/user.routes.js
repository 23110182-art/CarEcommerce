const express = require('express');
const userController = require('./user.controller');
const { protect, restrictTo } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/profile', userController.getMe);
router.put('/profile', userController.updateMe);
router.patch('/profile/password', userController.updateMyPassword);

// Admin-only User Management routes
router.get('/', restrictTo('admin'), userController.getAllUsers);
router.patch('/:id', restrictTo('admin'), userController.updateUser);
router.delete('/:id', restrictTo('admin'), userController.deleteUser);

module.exports = router;
