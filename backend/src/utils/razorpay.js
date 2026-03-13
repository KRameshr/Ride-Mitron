import Razorpay from 'razorpay';
import { env } from '../config/env.js';

export const razorpayInstance = new Razorpay({
    key_id: env.razorpay.keyId || 'rzp_test_dummyKeyId',
    key_secret: env.razorpay.keySecret || 'dummyKeySecret',
});
