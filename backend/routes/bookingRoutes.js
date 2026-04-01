import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import authMiddleware, { requireUserRole } from '../middleware/auth.js';

const router = express.Router();

// Authenticated user routes
router.post('/', authMiddleware, requireUserRole, bookingController.createBooking);
router.get('/my', authMiddleware, requireUserRole, bookingController.getMyBookings);
router.delete('/:id', authMiddleware, requireUserRole, bookingController.deleteMyBooking);

export default router;
