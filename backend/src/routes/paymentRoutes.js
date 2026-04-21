import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

// Public webhook endpoint (signature verified inside controller)
router.post("/webhook", razorpayWebhook);

router.use(protect);

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);

export default router;
