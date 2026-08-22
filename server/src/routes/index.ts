import { Router } from 'express';
import healthRoutes from './health.routes.js';
import taxonomyRoutes from './taxonomy.routes.js';
import authRoutes from './auth.routes.js';
import complaintRoutes from './complaint.routes.js';
import translateRoutes from './translate.routes.js';
import aiRoutes from './ai.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/taxonomy', taxonomyRoutes);
router.use('/auth', authRoutes);
router.use('/translate', translateRoutes);
router.use('/ai', aiRoutes);
router.use('/upload', uploadRoutes);
router.use('/', complaintRoutes);

export default router;
