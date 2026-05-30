const express = require('express');
const { protect } = require('../../shared/middleware/auth.middleware');
const { createReview, getReviewsByProductId } = require('./review.controller');

const router = express.Router();

router.route('/').post(protect, createReview);
router.route('/:productId').get(getReviewsByProductId);

module.exports = router;