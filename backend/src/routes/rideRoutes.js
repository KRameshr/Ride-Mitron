import express from 'express';
import { postRide, searchRides, getRideDetails } from '../controllers/rideController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All ride routes are protected

router.post('/', postRide);
router.get('/search', searchRides);
router.get('/:id', getRideDetails);

export default router;
