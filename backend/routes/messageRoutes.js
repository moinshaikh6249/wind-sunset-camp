import express from 'express';
import * as messageController from '../controllers/messageController.js';
import authMiddleware from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

// Public contact form route
router.post('/', messageController.createMessage);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, messageController.getAllMessages);
router.get('/:id', authMiddleware, adminMiddleware, messageController.getMessageById);
router.put('/:id/read', authMiddleware, adminMiddleware, messageController.markMessageAsRead);
router.delete('/:id', authMiddleware, adminMiddleware, messageController.deleteMessage);

export default router;
