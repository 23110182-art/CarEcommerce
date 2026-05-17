const mongoose = require('mongoose');
const slugify = require('slugify');

// Embedded Schema for Images
const carImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  sort_order: { type: Number, default: 0 }
});

// Embedded Schema for Features
const carFeatureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
});

const carSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  brand_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  sale_price: { type: Number },
  year: { type: Number, required: true },
  condition: { type: String, enum: ['new', 'used'], required: true },
  mileage: { type: Number, default: 0 },
  fuel_type: { type: String, enum: ['gasoline', 'diesel', 'electric', 'hybrid'], required: true },
  transmission: { type: String, enum: ['manual', 'automatic'], required: true },
  seats: { type: Number, required: true },
  color: { type: String, required: true },
  engine: { type: String },
  horsepower: { type: Number },
  stock: { type: Number, default: 0 },
  sold_count: { type: Number, default: 0 },
  description: { type: String },
  thumbnail: { type: String, required: true },
  is_featured: { type: Boolean, default: false },
  images: [carImageSchema],
  features: [carFeatureSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for query optimization
carSchema.index({ brand_id: 1 });
carSchema.index({ category_id: 1 });
carSchema.index({ price: 1 });
carSchema.index({ year: 1 });
carSchema.index({ fuel_type: 1 });
carSchema.index({ transmission: 1 });
carSchema.index({ created_at: -1 });
carSchema.index({ sold_count: -1 });

// Slug auto generation
carSchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Virtual properties
carSchema.virtual('is_new').get(function() {
  if (!this.createdAt) return false;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return this.createdAt >= sixMonthsAgo;
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
