import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';

export const connectDB = async () => {
    try {
        if (!env.mongoUri) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        // Configure mongoose
        mongoose.set('strictQuery', false);

        const conn = await mongoose.connect(env.mongoUri, { tlsAllowInvalidCertificates: true });
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};
