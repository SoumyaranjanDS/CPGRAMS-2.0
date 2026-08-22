import { Router } from 'express';
import { classifyDepartment, transcribeVoice } from '../controllers/ai.controller.js';

const router = Router();

// Route: POST /api/v1/ai/classify-department
router.post('/classify-department', classifyDepartment);

// Route: POST /api/v1/ai/transcribe-audio
router.post('/transcribe-audio', transcribeVoice);

export default router;
