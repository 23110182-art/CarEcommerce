const Post = require('./post.model');

class PostRepository {
  async create(data) {
    return await Post.create(data);
  }

  async findAll(query = {}) {
    return await Post.find(query).sort('-createdAt');
  }

  async findByIdOrSlug(idOrSlug) {
    const mongoose = require('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    return await Post.findOne(query);
  }

  async updateById(id, data) {
    const post = await Post.findById(id);
    if (!post) return null;
    
    Object.assign(post, data);
    return await post.save(); // save() to trigger slug hook
  }

  async deleteById(id) {
    return await Post.findByIdAndDelete(id);
  }
}

module.exports = new PostRepository();
