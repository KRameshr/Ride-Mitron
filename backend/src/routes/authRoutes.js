import express from 'express';
import { requestOTP, verifyOTP, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
