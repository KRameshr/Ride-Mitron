import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

// Route Definitions
import authRoutes from "./routes/authRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import agzRoutes from "./routes/agzRoutes.js";

const app = express();

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes
app.use(helmet());

// Logging
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/rides", rideRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/agz", agzRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
