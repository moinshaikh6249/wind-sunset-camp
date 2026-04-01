import express from 'express';
import * as adminController from '../controllers/adminController.js';
import authMiddleware, { requireAdminRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware, requireAdminRole);

// Admin identity & user management
router.get('/me', adminController.getCurrentAdmin);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/analytics', adminController.getAnalytics);

// Reviews
router.get('/reviews', adminController.getAllReviews);
router.put('/reviews/:id/visibility', adminController.updateReviewVisibility);
router.put('/reviews/:id/pin', adminController.updateReviewPin);
router.delete('/reviews/:id', adminController.deleteReview);

// Messages
router.get('/messages', adminController.getAllMessages);
router.get('/messages/:id', adminController.getMessageById);
router.put('/messages/:id/read', adminController.markMessageAsRead);
router.delete('/messages/:id', adminController.deleteMessage);

export default router;
