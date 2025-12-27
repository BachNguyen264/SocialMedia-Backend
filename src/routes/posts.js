const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  createPost,
  getPostById,
  validateCreatePost,
  validatePostId,
} = require("../controllers/postController");

router.use(authMiddleware);

router.post("/", validateCreatePost, validateRequest, createPost);
router.get("/:id", validatePostId, validateRequest, getPostById);

module.exports = router;
