const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner must have a title'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Banner must have an image']
  },
  link: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
