const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  createComment,
  getPostComments,
  validateCreateComment,
  validatePostId,
} = require("../controllers/commentController");

router.use(authMiddleware);

router.post(
  "/posts/:postId/comments",
  validatePostId,
  validateCreateComment,
  validateRequest,
  createComment
);
router.get(
  "/posts/:postId/comments",
  validatePostId,
  validateRequest,
  getPostComments
);

module.exports = router;
