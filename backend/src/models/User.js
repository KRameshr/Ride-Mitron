import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
        },
        phoneNumber: {
            type: String,
            unique: true,
            sparse: true,
            match: [/^\d{10}$/, 'Please add a valid 10-digit phone number'],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.USER,
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
        vehicleDetails: {
            hasVehicle: { type: Boolean, default: false },
            vehicleType: { type: String, enum: ['bike', 'scooty', 'car', 'auto'] },
            fuelType: { type: String, enum: ['petrol', 'diesel', 'electric'] },
            vehicleNumberPlate: String,
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

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
