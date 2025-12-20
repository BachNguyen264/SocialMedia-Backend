const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createPost,
  getPostById,
  validateCreatePost,
  validatePostId
} = require('../controllers/postController');

router.use(authMiddleware);

router.post('/', validateCreatePost, createPost);
router.get('/:id', validatePostId, getPostById);

module.exports = router;