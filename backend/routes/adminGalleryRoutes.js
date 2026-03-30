import express from 'express';
import * as adminGalleryController from '../controllers/adminGalleryController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { uploadAdminGalleryImage, useAdminGalleryUploadFolder } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/gallery', adminGalleryController.getGalleryImages);
router.post('/gallery/upload', useAdminGalleryUploadFolder, uploadAdminGalleryImage, adminGalleryController.uploadGalleryImage);
router.delete('/gallery/:id', adminGalleryController.deleteGalleryImage);

export default router;