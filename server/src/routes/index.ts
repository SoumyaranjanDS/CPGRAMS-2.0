import { Router } from 'express';
import healthRoutes from './health.routes.js';
import taxonomyRoutes from './taxonomy.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/taxonomy', taxonomyRoutes);
router.use('/auth', authRoutes);

export default router;
