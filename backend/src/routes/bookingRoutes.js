import express from "express";
import {
  requestBooking,
  respondToBooking,
  getMyRequests,
  cancelRequest,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", requestBooking);
router.put("/:requestId/respond", respondToBooking);
router.put("/:requestId/cancel", cancelRequest);
router.get("/my-requests", getMyRequests);

export default router;
