import express from 'express';
import authMiddleware from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/:id', authMiddleware, userController.getUserById);
router.get('/:id/history', authMiddleware, userController.getUserHistory);

export default router;