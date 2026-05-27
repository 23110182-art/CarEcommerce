const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a promotion name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a promotion description'],
  },
  discount_type: {
    type: String,
    enum: ['percentage', 'amount'],
    required: [true, 'Please specify discount type'],
  },
  discount_value: {
    type: Number,
    required: [true, 'Please specify discount value'],
    min: [0, 'Discount value cannot be negative'],
  },
  start_date: {
    type: Date,
    required: [true, 'Please specify promotion start date'],
  },
  end_date: {
    type: Date,
    required: [true, 'Please specify promotion end date'],
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  apply_to: {
    type: String,
    enum: ['all', 'brand', 'category', 'specific_cars'],
    required: [true, 'Please specify applicable scope'],
  },
  applicable_brands: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
  }],
  applicable_categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  applicable_cars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
  }],
}, {
  timestamps: true,
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
