import { Router } from 'express';
import {
  submitComplaint,
  syncDraft,
  getDraft,
  deleteDraft,
  getComplaintById,
  listComplaints,
} from '../controllers/complaint.controller.js';

const router = Router();

// Complaint registration & tracking
router.post('/complaints', submitComplaint);
router.get('/complaints', listComplaints);
router.get('/complaints/:id', getComplaintById);

// Drafts dual-layer sync & crash recovery
router.post('/drafts/sync', syncDraft);
router.get('/drafts/:sessionId', getDraft);
router.delete('/drafts/:sessionId', deleteDraft);

export default router;
