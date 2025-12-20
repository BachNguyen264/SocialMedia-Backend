const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createComment,
  getPostComments,
  validateCreateComment,
  validatePostId
} = require('../controllers/commentController');

router.use(authMiddleware);

router.post('/posts/:postId/comments', validatePostId, validateCreateComment, createComment);
router.get('/posts/:postId/comments', validatePostId, getPostComments);

module.exports = router;