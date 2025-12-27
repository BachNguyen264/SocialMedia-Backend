const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  getAllUsers,
  getUserById,
  getMyPosts,
  getUserComments,
  getUserLikes,
  validateUpdateUser,
  validateUserId,
  getMe,
  updateMe,
} = require("../controllers/userController");

router.use(authMiddleware);

router.get("/", getAllUsers);
router.get("/me", getMe);
router.patch("/me", validateUpdateUser, validateRequest, updateMe);
router.get("/me/posts", getMyPosts);
router.get("/:id", validateUserId, validateRequest, getUserById);
router.get("/:id/comments", validateUserId, validateRequest, getUserComments);
router.get("/:id/likes", validateUserId, validateRequest, getUserLikes);

module.exports = router;
