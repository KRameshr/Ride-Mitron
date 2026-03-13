// Mock OTP Service for production-ready template
import logger from '../utils/logger.js';

// In a real scenario, integrate Twilio or MSG91 here
export const sendOTP = async (phoneNumber, otp) => {
    try {
        logger.info(`Sending OTP ${otp} to ${phoneNumber}`);
        // await twilioClient.messages.create({ ... })
        return true;
    } catch (error) {
        logger.error('Failed to send OTP:', error);
        throw new Error('Failed to send OTP');
    }
};

export const generateOTP = () => {
    // Generate a random 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
};
