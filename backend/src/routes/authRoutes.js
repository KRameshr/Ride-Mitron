import express from "express";
import {
  signup,
  loginUser,
  requestOTP,
  verifyOTP,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", loginUser);
router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
