import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import authMiddleware from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

// Public routes
router.get('/', reviewController.getAllReviews);

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, reviewController.getAllReviewsAdmin);
router.put('/:id/visibility', authMiddleware, adminMiddleware, reviewController.toggleReviewVisibility);
router.put('/:id/pin', authMiddleware, adminMiddleware, reviewController.toggleReviewPin);
router.delete('/:id', authMiddleware, adminMiddleware, reviewController.deleteReview);

router.get('/:campId', reviewController.getReviewsByCamp);
router.post('/', authMiddleware, reviewController.createReview);
router.put('/:id', authMiddleware, reviewController.updateReview);

export default router;
