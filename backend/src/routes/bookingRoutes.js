import express from 'express';
import { requestBooking, respondToBooking, getMyRequests } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', requestBooking);
router.put('/:requestId/respond', respondToBooking);
router.get('/my-requests', getMyRequests);

export default router;
