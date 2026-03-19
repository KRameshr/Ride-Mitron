import express from 'express';
import { 
    getSession, 
    confirmInterest, 
    getChatMessages, 
    sendChatMessage,
    syncPaymentStatus
} from '../controllers/agzController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All AGZ routes require authentication

router.get('/session/:requestId', getSession);
router.post('/session/:requestId/confirm', confirmInterest);
router.get('/chat/:sessionId', getChatMessages);
router.post('/chat', sendChatMessage);
router.get('/sync/:requestId', syncPaymentStatus);

export default router;
