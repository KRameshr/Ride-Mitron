import express from "express";
import {
  updatePricingConfig,
  blockUser,
  getSystemStats,
  getAdminConfig,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly); // Require admin role

router.get("/config", getAdminConfig);
router.put("/config", updatePricingConfig);
router.post("/block-user", blockUser);
router.get("/stats", getSystemStats);

export default router;
