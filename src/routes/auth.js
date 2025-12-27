const express = require("express");
const router = express.Router();
const { apiLimiter, loginLimiter } = require("../middleware/rateLimit");
const validateRequest = require("../middleware/validateRequest");
const {
  register,
  login,
  validateRegister,
  validateLogin,
} = require("../controllers/authController");

router.post(
  "/register",
  apiLimiter,
  validateRegister,
  validateRequest,
  register
);
router.post("/login", loginLimiter, validateLogin, validateRequest, login);

module.exports = router;
