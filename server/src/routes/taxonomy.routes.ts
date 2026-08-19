import { Router } from 'express';
import {
  getDepartments,
  getCategories,
  resolvePinCode,
} from '../controllers/taxonomy.controller.js';

const router = Router();

router.get('/departments', getDepartments);
router.get('/categories', getCategories);
router.get('/pin/:pinCode', resolvePinCode);

export default router;
