import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { uploadAttachment } from '../controllers/upload.controller.js';

const router = Router();

// Support multiple files under 'files' field or single file under 'file'
router.post('/', upload.array('files', 5), uploadAttachment);
router.post('/single', upload.single('file'), uploadAttachment);

export default router;
