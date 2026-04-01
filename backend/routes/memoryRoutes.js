import express from 'express';
import * as memoryController from '../controllers/memoryController.js';
import authMiddleware, { requireUserRole } from '../middleware/auth.js';
import { useMemoriesUploadFolder, uploadMemoryImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', memoryController.getApprovedMemories);
router.get('/my', authMiddleware, requireUserRole, memoryController.getMyMemories);
router.post('/', authMiddleware, requireUserRole, useMemoriesUploadFolder, uploadMemoryImage, memoryController.createMemory);
router.delete('/:id', authMiddleware, requireUserRole, memoryController.deleteMyMemory);

export default router;
