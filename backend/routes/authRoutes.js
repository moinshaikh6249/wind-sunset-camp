import express from 'express';
import authMiddleware from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/update-profile', authMiddleware, authController.updateProfile);

export default router;
