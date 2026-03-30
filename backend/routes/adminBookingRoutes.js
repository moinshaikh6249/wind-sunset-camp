import express from 'express';
import * as adminBookingController from '../controllers/adminBookingController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/bookings', adminBookingController.getAllBookings);
router.patch('/bookings/:id/approve', adminBookingController.approveBooking);
router.patch('/bookings/:id/reject', adminBookingController.rejectBooking);

export default router;