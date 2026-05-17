const postService = require('./post.service');
const ApiResponse = require('../../shared/response/ApiResponse');
const asyncHandler = require('../../shared/utils/asyncHandler');
const AppError = require('../../shared/errors/AppError');
const { createPostSchema, updatePostSchema } = require('./post.validation');

const validate = (schema, data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  return value;
};

class PostController {
  createPost = asyncHandler(async (req, res, next) => {
    const validData = validate(createPostSchema, req.body);
    const post = await postService.createPost(validData);
    res.status(201).json(new ApiResponse(201, post, 'Post created successfully'));
  });

  getAllPosts = asyncHandler(async (req, res, next) => {
    const posts = await postService.getAllPosts();
    res.status(200).json(new ApiResponse(200, posts, 'Posts fetched successfully'));
  });

  getPost = asyncHandler(async (req, res, next) => {
    const post = await postService.getPostByIdOrSlug(req.params.id);
    res.status(200).json(new ApiResponse(200, post, 'Post fetched successfully'));
  });

  updatePost = asyncHandler(async (req, res, next) => {
    const validData = validate(updatePostSchema, req.body);
    const post = await postService.updatePost(req.params.id, validData);
    res.status(200).json(new ApiResponse(200, post, 'Post updated successfully'));
  });

  deletePost = asyncHandler(async (req, res, next) => {
    await postService.deletePost(req.params.id);
    res.status(204).json(new ApiResponse(204, null, 'Post deleted successfully'));
  });
}

module.exports = new PostController();
