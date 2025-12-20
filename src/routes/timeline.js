const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getTimeline } = require('../controllers/postController');

router.use(authMiddleware);
router.get('/', getTimeline);

module.exports = router;