import mongoose from 'mongoose';

const adminConfigSchema = new mongoose.Schema(
    {
        petrolPrice: {
            type: Number,
            required: true,
            default: 100, // per liter
        },
        dieselPrice: {
            type: Number,
            required: true,
            default: 90, // per liter
        },
        driverMinFee: {
            type: Number,
            required: true,
            default: 10,
        },
        riderMinFee: {
            type: Number,
            required: true,
            default: 15,
        },
        driverPercentage: {
            type: Number,
            required: true,
            default: 5,
        },
        riderPercentage: {
            type: Number,
            required: true,
            default: 10,
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('AdminConfig', adminConfigSchema);
