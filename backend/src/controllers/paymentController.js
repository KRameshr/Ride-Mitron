import crypto from 'crypto';
import { razorpayInstance } from '../utils/razorpay.js';
import { env } from '../config/env.js';
import RideRequest from '../models/RideRequest.js';
import { REQUEST_STATUS } from '../config/constants.js';

export const createPaymentOrder = async (req, res, next) => {
    try {
        const { requestId } = req.body;
        const request = await RideRequest.findById(requestId).populate('ride');

        if (!request) return res.status(404).json({ message: 'Request not found' });

        let amount = 0;
        let paymentType = '';

        if (req.user._id.toString() === request.passenger.toString()) {
            if (request.paymentStatus === 'COMPLETED') {
                return res.status(400).json({ message: 'Rider fee already paid' });
            }
            amount = request.ride.riderPlatformFee * request.seatsRequested;
            paymentType = 'RIDER_FEE';
        } else if (req.user._id.toString() === request.ride.driver.toString()) {
            if (request.status !== REQUEST_STATUS.PENDING) {
                return res.status(400).json({ message: 'Request already processed' });
            }
            amount = request.ride.driverPlatformFee * request.seatsRequested;
            paymentType = 'DRIVER_FEE';
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Dummy keys fallback
        const secret = env.razorpay.keySecret || 'dummyKeySecret';
        if (amount <= 0) amount = 1; // razorpay min is 1 INR usually, but let's say minimum is fee

        const options = {
            amount: Math.round(amount * 100), // in paise
            currency: 'INR',
            receipt: `rcpt_${requestId}_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);

        res.status(200).json({
            order,
            paymentType,
            amount,
            keyId: env.razorpay.keyId || 'rzp_test_dummyKeyId'
        });
    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            requestId,
            paymentType
        } = req.body;

        const secret = env.razorpay.keySecret || 'dummyKeySecret';
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        // Allow bypassing signature locally if dummy strings
        const isAuthentic = expectedSignature === razorpay_signature || env.nodeEnv === 'development';

        if (!isAuthentic && env.nodeEnv !== 'development') {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        const request = await RideRequest.findById(requestId).populate('ride');

        if (paymentType === 'RIDER_FEE') {
            request.paymentStatus = 'COMPLETED';
            await request.save();
        } else if (paymentType === 'DRIVER_FEE') {
            request.status = REQUEST_STATUS.ACCEPTED;
            await request.save();

            // Deduct seats
            request.ride.availableSeats -= request.seatsRequested;
            await request.ride.save();
        }

        res.status(200).json({ message: 'Payment verified successfully', request });
    } catch (error) {
        next(error);
    }
};
