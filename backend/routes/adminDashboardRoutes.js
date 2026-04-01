import express from 'express';
import authMiddleware, { requireAdminRole } from '../middleware/auth.js';
import { getAdminStats } from '../controllers/adminDashboardController.js';

const router = express.Router();

router.use(authMiddleware, requireAdminRole);

router.get('/stats', getAdminStats);

export default router;