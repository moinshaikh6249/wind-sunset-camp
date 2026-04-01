import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import authMiddleware, { requireAdminRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware, requireAdminRole);

router.get('/bookings', bookingController.getAllBookings);
router.get('/bookings/:id', bookingController.getBookingById);
router.patch('/bookings/:id/approve', bookingController.approveBooking);
router.patch('/bookings/:id/reject', bookingController.rejectBooking);
router.put('/bookings/:id/status', bookingController.updateBookingStatus);
router.delete('/bookings/:id', bookingController.deleteBooking);

export default router;