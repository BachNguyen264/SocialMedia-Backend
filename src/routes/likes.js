const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  likePost,
  unlikePost,
  getPostLikes,
  validatePostId
} = require('../controllers/likeController');

router.use(authMiddleware);

router.post('/posts/:postId/like', validatePostId, likePost);
router.delete('/posts/:postId/like', validatePostId, unlikePost);
router.get('/posts/:postId/likes', validatePostId, getPostLikes);

module.exports = router;