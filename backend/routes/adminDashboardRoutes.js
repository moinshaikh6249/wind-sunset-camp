import express from 'express';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { getAdminStats } from '../controllers/adminDashboardController.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', getAdminStats);

export default router;