import { Router } from 'express';
import {
  submitComplaint,
  syncDraft,
  getDraft,
  deleteDraft,
  getComplaintById,
  listComplaints,
} from '../controllers/complaint.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Complaint registration & tracking
router.post('/complaints', authenticate, submitComplaint);
router.get('/complaints', authenticate, listComplaints);
router.get('/complaints/:id', getComplaintById); // Public status lookup

// Drafts dual-layer sync & crash recovery
router.post('/drafts/sync', syncDraft);
router.get('/drafts/:sessionId', getDraft);
router.delete('/drafts/:sessionId', deleteDraft);

export default router;
