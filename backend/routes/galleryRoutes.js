import express from 'express';
import * as galleryController from '../controllers/galleryController.js';
import authMiddleware from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

// Public route
router.get('/', galleryController.getAllGalleryImages);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, galleryController.createGalleryImage);
router.get('/:id', galleryController.getGalleryImageById);
router.put('/:id', authMiddleware, adminMiddleware, galleryController.updateGalleryImage);
router.delete('/:id', authMiddleware, adminMiddleware, galleryController.deleteGalleryImage);

export default router;
