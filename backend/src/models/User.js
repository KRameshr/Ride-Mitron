import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        phoneNumber: {
            type: String,
            required: [true, 'Please add a phone number'],
            unique: true,
            match: [/^\d{10}$/, 'Please add a valid 10-digit phone number'],
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.USER,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        vehicleDetails: {
            hasVehicle: { type: Boolean, default: false },
            vehicleType: { type: String, enum: ['bike', 'scooty', 'car', 'auto'] },
            fuelType: { type: String, enum: ['petrol', 'diesel'] },
            number: String,
            model: String,
            mileage: Number,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'BLOCKED'],
            default: 'ACTIVE',
        },
        rating: {
            type: Number,
            default: 5.0,
            min: 1,
            max: 5,
        },
        totalRidesGiven: {
            type: Number,
            default: 0,
        },
        totalRidesTaken: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('User', userSchema);
