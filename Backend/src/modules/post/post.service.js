const postRepository = require('./post.repository');
const AppError = require('../../shared/errors/AppError');

class PostService {
  async createPost(data) {
    return await postRepository.create(data);
  }

  async getAllPosts() {
    return await postRepository.findAll();
  }

  async getPostByIdOrSlug(idOrSlug) {
    const post = await postRepository.findByIdOrSlug(idOrSlug);
    if (!post) {
      throw new AppError('No post found with that ID or Slug', 404);
    }
    return post;
  }

  async updatePost(id, data) {
    const post = await postRepository.updateById(id, data);
    if (!post) {
      throw new AppError('No post found with that ID', 404);
    }
    return post;
  }

  async deletePost(id) {
    const post = await postRepository.deleteById(id);
    if (!post) {
      throw new AppError('No post found with that ID', 404);
    }
    return null;
  }
}

module.exports = new PostService();
