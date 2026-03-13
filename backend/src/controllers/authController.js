import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { sendOTP, generateOTP } from '../services/otpService.js';
import logger from '../utils/logger.js';

// Temporary memory store for OTPs (Use Redis in production Phase 2)
const otpStore = new Map();

const generateToken = (id) => {
    return jwt.sign({ id }, env.jwt.secret, {
        expiresIn: env.jwt.expiresIn,
    });
};

export const requestOTP = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber || phoneNumber.length !== 10) {
            return res.status(400).json({ message: 'Invalid phone number' });
        }

        const otp = generateOTP();
        otpStore.set(phoneNumber, {
            otp,
            expires: Date.now() + 10 * 60 * 1000 // 10 mins
        });

        await sendOTP(phoneNumber, otp);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        next(error);
    }
};

export const verifyOTP = async (req, res, next) => {
    try {
        const { phoneNumber, otp } = req.body;
        const storedData = otpStore.get(phoneNumber);

        if (!storedData) {
            return res.status(400).json({ message: 'OTP not requested or expired' });
        }

        if (Date.now() > storedData.expires) {
            otpStore.delete(phoneNumber);
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (storedData.otp !== otp) {
            // Allow a backdoor for testing in dev
            if (env.nodeEnv === 'production' || otp !== '123456') {
                return res.status(400).json({ message: 'Invalid OTP' });
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
                isVerified: true
            });
            isNewUser = true;
        }

        res.status(200).json({
            message: 'Login successful',
            isNewUser,
            user: {
                _id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role,
                vehicleDetails: user.vehicleDetails,
            },
            token: generateToken(user._id)
        });

    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
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
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        if (req.body.vehicleDetails) {
            user.vehicleDetails = {
                ...user.vehicleDetails,
                ...req.body.vehicleDetails,
                hasVehicle: true
            };
        }

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
};
