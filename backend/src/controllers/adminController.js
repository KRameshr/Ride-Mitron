import AdminConfig from "../models/AdminConfig.js";
import User from "../models/User.js";
import RideRequest from "../models/RideRequest.js";
import Ride from "../models/Ride.js";

export const updatePricingConfig = async (req, res, next) => {
  try {
    const {
      driverMinFee,
      riderMinFee,
      driverPercentage,
      riderPercentage,
      petrolPricePerLitre,
      dieselPricePerLitre,
    } = req.body;

    // Either update the existing one or create new
    let config = await AdminConfig.findOne().sort({ createdAt: -1 });

    if (config) {
      config.driverMinFee = driverMinFee;
      config.riderMinFee = riderMinFee;
      config.driverPercentage = driverPercentage;
      config.riderPercentage = riderPercentage;
      config.petrolPricePerLitre = petrolPricePerLitre;
      config.dieselPricePerLitre = dieselPricePerLitre;
      config.lastUpdatedBy = req.user._id;
      await config.save();
    } else {
      config = await AdminConfig.create({
        driverMinFee,
        riderMinFee,
        driverPercentage,
        riderPercentage,
        petrolPricePerLitre,
        dieselPricePerLitre,
        lastUpdatedBy: req.user._id,
      });
    }

    res.status(200).json(config);
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    await user.save();

    res.status(200).json({
      message: `User ${phoneNumber} status changed to ${user.status}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRides = await Ride.countDocuments();
    const totalBookings = await RideRequest.countDocuments();

    // Total revenue = sum of platform fees for ACCEPTED requests
    const completedRequests = await RideRequest.find({ status: "ACCEPTED" })
      .populate("ride", "driverPlatformFee riderPlatformFee")
      .lean();

    let totalRevenue = 0;
    completedRequests.forEach((req) => {
      if (req.ride) {
        totalRevenue +=
          (req.ride.driverPlatformFee || 0) + (req.ride.riderPlatformFee || 0);
      }
    });

    // Get lists for tables
    const recentUsers = await User.find()
      .select("name phoneNumber status createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentRides = await Ride.find()
      .populate("driver", "name phoneNumber")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const config = await AdminConfig.findOne().sort({ createdAt: -1 }).lean();

    res.status(200).json({
      totalUsers,
      totalRides,
      totalBookings,
      totalRevenue,
      recentUsers,
      recentRides,
      currentConfig: config || {
        driverMinFee: 10,
        riderMinFee: 15,
        driverPercentage: 5,
        riderPercentage: 10,
        petrolPricePerLitre: 100,
        dieselPricePerLitre: 90,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminConfig = async (req, res, next) => {
  try {
    const config = await AdminConfig.findOne().sort({ createdAt: -1 }).lean();
    res.status(200).json(
      config || {
        driverMinFee: 10,
        riderMinFee: 15,
        driverPercentage: 5,
        riderPercentage: 10,
        petrolPricePerLitre: 100,
        dieselPricePerLitre: 90,
      },
    );
  } catch (error) {
    next(error);
  }
};
