const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  checkEmail,
  logoutUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP,
} = require("../controller/authcontroller");
const { protect } = require("../middleware/Authmiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/check-email", checkEmail);
router.post("/logout", logoutUser);

// 🔑 Forgot Password routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOTP);

// Protected route
router.get("/me", protect, getMe);

module.exports = router;