const express = require("express");
const router = express.Router();
const {
  requestOTP,
  verifyLoginOTP,
  resendAuthOTP,
  getMe,
  logoutUser,
  updateProfile,
  updateAddress,
} = require("../controller/authcontroller");
const { protect } = require("../middleware/Authmiddleware");

router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyLoginOTP);
router.post("/resend-otp", resendAuthOTP);
router.post("/logout", logoutUser);

router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/address", protect, updateAddress);

module.exports = router;