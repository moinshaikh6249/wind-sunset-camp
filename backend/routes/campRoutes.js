import express from 'express';
import * as campController from '../controllers/campController.js';

const router = express.Router();

router.get('/', campController.getAllCamps);
router.get('/search', campController.searchCamps);
router.get('/upcoming', campController.getUpcomingCamps);
router.get('/featured', campController.getFeaturedCamps);
router.get('/:id', campController.getCampById);

export default router;