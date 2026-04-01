import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import {
  deleteAllNotifications,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);
router.delete('/delete-all', deleteAllNotifications);

export default router;
