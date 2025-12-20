const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  addFriend,
  removeFriend,
  getUserFriends,
  validateUserId
} = require('../controllers/friendController');

router.use(authMiddleware);

router.post('/users/:userId/friends', validateUserId, addFriend);
router.delete('/users/:userId/friends', validateUserId, removeFriend);
router.get('/users/:userId/friends', validateUserId, getUserFriends);

module.exports = router;