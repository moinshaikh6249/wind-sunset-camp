import express from 'express';
import * as messageController from '../controllers/messageController.js';

const router = express.Router();

// Public contact form route
router.post('/', messageController.createMessage);

export default router;
