import express from 'express';
import * as memoryController from '../controllers/memoryController.js';
import authMiddleware from '../middleware/auth.js';
import { useMemoriesUploadFolder, uploadMemoryImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', memoryController.getApprovedMemories);
router.get('/my', authMiddleware, memoryController.getMyMemories);
router.post('/', authMiddleware, useMemoriesUploadFolder, uploadMemoryImage, memoryController.createMemory);
router.delete('/:id', authMiddleware, memoryController.deleteMyMemory);

export default router;
