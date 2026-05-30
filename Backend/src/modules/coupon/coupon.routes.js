const express = require('express');
const { protect } = require('../../shared/middleware/auth.middleware');
const CouponRepository = require('./coupon.repository');
const UserRepository = require('../user/user.repository');

const router = express.Router();

router.get('/active', async (req, res, next) => {
  try {
    const coupons = await CouponRepository.findActiveCoupons();
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
});

router.post('/apply', protect, async (req, res, next) => {
  try {
    const { code, orderValue } = req.body;
    const coupon = await CouponRepository.findByCode(code);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    }

    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is ${coupon.minOrderValue}`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderValue * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      data: {
        couponId: coupon._id,
        code: coupon.code,
        discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/use-points', protect, async (req, res, next) => {
  try {
    const { points, orderValue } = req.body;
    const user = await UserRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.loyaltyPoints < points) {
      return res.status(400).json({ success: false, message: 'Not enough loyalty points' });
    }

    // 1 point = 1000 VND (or currency units)
    const pointsValue = points * 1000;
    const finalValue = Math.max(0, orderValue - pointsValue);

    res.status(200).json({
      success: true,
      data: {
        pointsUsed: points,
        pointsValue,
        finalValue,
      },
    });
  } catch (error) {
    next(error);
  }
});

const { restrictTo } = require('../../shared/middleware/auth.middleware');
const Coupon = require('./coupon.model');

// Admin Coupon Management Routes
router.post('/', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
