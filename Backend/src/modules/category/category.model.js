const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category must have a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  slug: {
    type: String,
    unique: true,
  }
}, {
  timestamps: true
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
categorySchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
