const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  getUserPosts,
  getUserComments,
  getUserLikes,
  validateUpdateUser,
  validateUserId
} = require('../controllers/userController');

router.use(authMiddleware);

router.get('/', getAllUsers);
router.get('/:id', validateUserId, getUserById);
router.put('/:id', validateUserId, validateUpdateUser, updateUser);
router.get('/:id/posts', validateUserId, getUserPosts);
router.get('/:id/comments', validateUserId, getUserComments);
router.get('/:id/likes', validateUserId, getUserLikes);

module.exports = router;