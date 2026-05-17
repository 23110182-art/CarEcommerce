const express = require('express');
const userController = require('./user.controller');
const { protect } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/profile', userController.getMe);
router.put('/profile', userController.updateMe);

module.exports = router;
