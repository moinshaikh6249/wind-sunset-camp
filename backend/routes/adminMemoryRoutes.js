import express from 'express';
import * as memoryController from '../controllers/memoryController.js';
import authMiddleware, { requireAdminRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware, requireAdminRole);

router.get('/memories', memoryController.getAllMemoriesAdmin);
router.patch('/memories/:id/approve', memoryController.approveMemory);
router.patch('/memories/:id/reject', memoryController.rejectMemory);
router.delete('/memories/:id', memoryController.deleteMemoryAdmin);

export default router;
