import { Router } from 'express';
import { translateBatch, translateSingle } from '../controllers/translate.controller.js';

const router = Router();

// Batch and single translation endpoints
router.post('/', translateBatch);
router.post('/batch', translateBatch);
router.post('/single', translateSingle);

export default router;
