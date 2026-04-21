import mongoose from "mongoose";
import { REQUEST_STATUS } from "../config/constants.js";

const rideRequestSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seatsRequested: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    riderPaid: {
      type: Boolean,
      default: false,
    },
    driverPaid: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  },
);

rideRequestSchema.index({ ride: 1, passenger: 1 });
rideRequestSchema.index({ passenger: 1, status: 1 });

export default mongoose.model("RideRequest", rideRequestSchema);
