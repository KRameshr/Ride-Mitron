import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { sendOTP, generateOTP } from "../services/otpService.js";
import logger from "../utils/logger.js";

// Temporary memory store for OTPs (Use Redis in production Phase 2)
const otpStore = new Map();

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password, confirmPassword } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json({ message: "Email or Phone Number is required" });
    }

    // Check if user exists
    const query = [];
    if (email) query.push({ email });
    if (phoneNumber) query.push({ phoneNumber });

    const userExists = await User.findOne({ $or: query });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email or phone" });
    }

    // Assign ADMIN role if email matches admin email
    let role = "USER";
    if (
      email &&
      email.toLowerCase() === env.defaults.adminEmail.toLowerCase()
    ) {
      role = "ADMIN";
    }

    const user = await User.create({
      name,
      email,
      phoneNumber,
      password,
      role,
      isVerified: true, // Auto-verifying for credential-based flow for now
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Please provide identifier and password" });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "BLOCKED") {
      return res
        .status(403)
        .json({ message: "Your account is blocked. Contact support." });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        vehicleDetails: user.vehicleDetails,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const requestOTP = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber || phoneNumber.length !== 10) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const otp = generateOTP();
    otpStore.set(phoneNumber, {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    await sendOTP(phoneNumber, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;
    const storedData = otpStore.get(phoneNumber);

    if (!storedData) {
      return res.status(400).json({ message: "OTP not requested or expired" });
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (storedData.otp !== otp) {
      // Allow a backdoor for testing in dev
      if (env.nodeEnv === "production" || otp !== "123456") {
        return res.status(400).json({ message: "Invalid OTP" });
      }
    }

    // OTP Valid
    otpStore.delete(phoneNumber);

    let user = await User.findOne({ phoneNumber });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        phoneNumber,
        name: `User${phoneNumber.slice(-4)}`,
        password: Math.random().toString(36).slice(-10), // Placeholder for OTP-created users
        isVerified: true,
      });
      isNewUser = true;
    }

    res.status(200).json({
      message: "Login successful",
      isNewUser,
      user: {
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        vehicleDetails: user.vehicleDetails,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    if (req.body.vehicleDetails) {
      user.vehicleDetails = {
        ...user.vehicleDetails,
        ...req.body.vehicleDetails,
        hasVehicle: true,
      };
    }

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
