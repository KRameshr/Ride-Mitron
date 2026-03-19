import mongoose from 'mongoose';

const agzSessionSchema = new mongoose.Schema(
    {
        rideRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RideRequest',
            required: true,
            unique: true
        },
        currentStage: {
            type: String,
            enum: ['MATCHED', 'CHATTING', 'CONFIRMED', 'PAID', 'UNLOCKED', 'COMPLETED'],
            default: 'MATCHED'
        },
        isRiderConfirmed: {
            type: Boolean,
            default: false
        },
        isDriverConfirmed: {
            type: Boolean,
            default: false
        },
        unlockTime: {
            type: Date
        },
        metadata: {
            type: Map,
            of: String
        }
    },
    {
        timestamps: true,
    }
);

// No redundant index needed here as rideRequest: { unique: true } already handles it

export default mongoose.model('AGZSession', agzSessionSchema);
