import AGZSession from '../models/AGZSession.js';
import ChatMessage from '../models/ChatMessage.js';
import RideRequest from '../models/RideRequest.js';
import { REQUEST_STATUS } from '../config/constants.js';

// Utility to mask phone numbers and external links
const maskSensitiveInfo = (text) => {
    // Mask phone numbers (10 digits)
    const phoneRegex = /(\d{3})\d{4}(\d{3})/g;
    let masked = text.replace(phoneRegex, '$1****$2');
    
    // Mask links
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    masked = masked.replace(linkRegex, '[LINK REMOVED FOR SAFETY]');
    
    return masked;
};

export const getSession = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        let session = await AGZSession.findOne({ rideRequest: requestId }).populate({
            path: 'rideRequest',
            populate: [
                { path: 'ride', populate: 'driver' },
                { path: 'passenger' }
            ]
        });

        if (!session) {
            // Auto-init session if it doesn't exist but the request does
            const request = await RideRequest.findById(requestId);
            if (!request) return res.status(404).json({ message: 'Ride request not found' });
            
            session = await AGZSession.create({ rideRequest: requestId });
            session = await session.populate({
                path: 'rideRequest',
                populate: [
                    { path: 'ride', populate: 'driver' },
                    { path: 'passenger' }
                ]
            });
        }

        const sessionObj = session.toObject();
        const isRider = sessionObj.rideRequest.passenger._id.toString() === req.user._id.toString();
        const isDriver = sessionObj.rideRequest.ride.driver._id.toString() === req.user._id.toString();

        // Enforce Partial Visibility
        if (sessionObj.currentStage !== 'UNLOCKED') {
            if (isRider && sessionObj.rideRequest.ride.driver) {
                sessionObj.rideRequest.ride.driver.phoneNumber = 'HIDDEN (Pay to Unlock)';
            }
            if (isDriver && sessionObj.rideRequest.passenger) {
                sessionObj.rideRequest.passenger.phoneNumber = 'HIDDEN (Await Commit)';
            }
        }

        res.status(200).json(sessionObj);
    } catch (error) {
        next(error);
    }
};

export const confirmInterest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const session = await AGZSession.findOne({ rideRequest: requestId }).populate('rideRequest');
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const isPassenger = session.rideRequest.passenger.toString() === req.user._id.toString();
        const isDriver = session.rideRequest.ride && session.rideRequest.ride.driver.toString() === req.user._id.toString();

        if (isPassenger) session.isRiderConfirmed = true;
        if (isDriver) session.isDriverConfirmed = true;

        if (session.isRiderConfirmed && session.isDriverConfirmed && session.currentStage !== 'CONFIRMED') {
            session.currentStage = 'CONFIRMED';
            await ChatMessage.create({
                session: session._id,
                sender: req.user._id,
                content: "⚡ BOTH PEERS HAVE CONFIRMED INTEREST! The commitment gate is now open. Please proceed to settle the platform fee to unlock direct coordination.",
                isSystemMessage: true
            });
        } else if (session.isRiderConfirmed || session.isDriverConfirmed) {
            session.currentStage = 'CHATTING';
        }

        await session.save();
        res.status(200).json(session);
    } catch (error) {
        next(error);
    }
};

export const getChatMessages = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const messages = await ChatMessage.find({ session: sessionId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name rating');
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

export const sendChatMessage = async (req, res, next) => {
    try {
        const { sessionId, content } = req.body;
        const session = await AGZSession.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const maskedContent = maskSensitiveInfo(content);

        const message = await ChatMessage.create({
            session: sessionId,
            sender: req.user._id,
            content: maskedContent
        });

        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
};

export const syncPaymentStatus = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const session = await AGZSession.findOne({ rideRequest: requestId }).populate('rideRequest');
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const { rideRequest } = session;

        if (rideRequest.riderPaid && rideRequest.driverPaid) {
            session.currentStage = 'PAID';
            if (rideRequest.status === REQUEST_STATUS.ACCEPTED) {
                session.currentStage = 'UNLOCKED';
                session.unlockTime = new Date();
            }
        } else if (rideRequest.riderPaid || rideRequest.driverPaid) {
            session.currentStage = 'PAID'; // Partial payment
        }

        await session.save();
        res.status(200).json(session);
    } catch (error) {
        next(error);
    }
};
