import express from "express";
import {
    postRide,
    searchRides,
    getRideDetails,
    updateRideStatus,
    cancelRide,
    getMyRides
} from "../controllers/rideController.js";

import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
Public routes
Anyone can search rides and view ride details
*/

router.get("/search", optionalAuth, searchRides);
router.get("/my-rides", protect, getMyRides);
router.get("/:id", optionalAuth, getRideDetails);

/*
Protected routes
Only logged-in users can create or manage rides
*/

router.post("/", protect, postRide);
router.put("/:id/status", protect, updateRideStatus);
router.put("/:id/cancel", protect, cancelRide);

export default router;