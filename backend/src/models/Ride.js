import mongoose from "mongoose";
import { RIDE_STATUS } from "../config/constants.js";

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    origin: {
      name: { type: String, required: true },
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },
    destination: {
      name: { type: String, required: true },
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], required: true },
      },
    },
    startTime: {
      type: Date,
      required: true,
    },
    distanceKm: {
      type: Number,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    driverFee: {
      type: Number,
      required: true,
      default: 0,
    },
    riderFee: {
      type: Number,
      required: true,
      default: 0,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ["bike", "scooty", "car", "auto"],
      required: true,
    },
    fuelCost: {
      type: Number,
      required: true,
    },
    driverPlatformFee: {
      type: Number,
      required: true,
    },
    riderPlatformFee: {
      type: Number,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true, // Total cost calculated over the whole ride (fuel + platform fees)
    },
    costPerSeat: {
      type: Number,
      required: true, // Per-person cost (fuel share + platform fee)
    },
    status: {
      type: String,
      enum: Object.values(RIDE_STATUS),
      default: RIDE_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

rideSchema.index({ "origin.location": "2dsphere" });
rideSchema.index({ "destination.location": "2dsphere" });
rideSchema.index({ status: 1, availableSeats: 1, startTime: 1 });

export default mongoose.model("Ride", rideSchema);
