const express = require('express');
const postController = require('./post.controller');
const { protect, restrictTo } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPost);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', postController.createPost);
router.patch('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;
