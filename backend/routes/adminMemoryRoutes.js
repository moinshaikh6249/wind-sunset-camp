import express from 'express';
import * as memoryController from '../controllers/memoryController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/memories', memoryController.getAllMemoriesAdmin);
router.patch('/memories/:id/approve', memoryController.approveMemory);
router.patch('/memories/:id/reject', memoryController.rejectMemory);
router.delete('/memories/:id', memoryController.deleteMemoryAdmin);

export default router;
