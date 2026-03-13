import dotenv from 'dotenv';
dotenv.config();

export const env = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI,
    jwt: {
        secret: process.env.JWT_SECRET || 'secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY,
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
    },
    defaults: {
        platformFee: Number(process.env.PLATFORM_FEE) || 5,
        petrolPrice: Number(process.env.PETROL_PRICE) || 100,
    }
};
