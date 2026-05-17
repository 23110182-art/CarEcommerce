const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post must have a title'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  thumbnail: {
    type: String,
    required: [true, 'Post must have a thumbnail']
  },
  content: {
    type: String,
    required: [true, 'Post must have content']
  }
}, {
  timestamps: true
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
postSchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
