import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import authMiddleware from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

// Authenticated user routes
router.post('/', authMiddleware, bookingController.createBooking);
router.get('/my', authMiddleware, bookingController.getMyBookings);
router.delete('/:id', authMiddleware, bookingController.deleteMyBooking);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, bookingController.getAllBookings);
router.get('/:id', authMiddleware, adminMiddleware, bookingController.getBookingById);
router.patch('/:id/approve', authMiddleware, adminMiddleware, bookingController.approveBooking);
router.patch('/:id/reject', authMiddleware, adminMiddleware, bookingController.rejectBooking);
router.put('/:id/status', authMiddleware, adminMiddleware, bookingController.updateBookingStatus);
router.delete('/:id/admin', authMiddleware, adminMiddleware, bookingController.deleteBooking);

export default router;
