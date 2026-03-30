import express from 'express';
import * as adminCampController from '../controllers/adminCampController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { useCampUploadFolder, uploadCampImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.post('/upload-image', useCampUploadFolder, uploadCampImage, adminCampController.uploadCampImage);
router.get('/camps', adminCampController.getAllCamps);
router.get('/camps/:id', adminCampController.getCampById);
router.post('/camps', useCampUploadFolder, uploadCampImage, adminCampController.createCamp);
router.put('/camps/:id', useCampUploadFolder, uploadCampImage, adminCampController.updateCamp);
router.delete('/camps/:id', adminCampController.deleteCamp);

export default router;