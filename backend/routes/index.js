import express from 'express';

import campRoutes from './campRoutes.js';
import authRoutes from './authRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import userRoutes from './userRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import messageRoutes from './messageRoutes.js';
import galleryRoutes from './galleryRoutes.js';
import memoryRoutes from './memoryRoutes.js';
import adminAuthRoutes from './adminAuthRoutes.js';
import adminBookingRoutes from './adminBookingRoutes.js';
import adminCampRoutes from './adminCampRoutes.js';
import adminDashboardRoutes from './adminDashboardRoutes.js';
import adminGalleryRoutes from './adminGalleryRoutes.js';
import adminMemoryRoutes from './adminMemoryRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/camps', campRoutes);
router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/messages', messageRoutes);
router.use('/gallery', galleryRoutes);
router.use('/memories', memoryRoutes);
router.use('/admin', adminAuthRoutes);
router.use('/admin/dashboard', adminDashboardRoutes);
router.use('/admin', adminBookingRoutes);
router.use('/admin', adminCampRoutes);
router.use('/admin', adminGalleryRoutes);
router.use('/admin', adminMemoryRoutes);
router.use('/admin', adminRoutes);

export default router;
