const mongoose = require('mongoose');
const slugify = require('slugify');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand must have a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Brand name cannot be more than 50 characters']
  },
  slug: {
    type: String,
    unique: true,
  },
  logo: {
    type: String,
    // Will be required later when we implement Cloudinary upload
  },
  country: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
brandSchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
