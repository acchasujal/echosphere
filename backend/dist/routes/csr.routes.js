import { Router } from 'express';
import { handleCreateCSRActivity, handleDeleteCSRActivity, handleGetCSRActivities, handleGetCSRActivityById, handleUpdateCSRActivity, } from '../controllers/csr.controller.js';
const router = Router();
router.get('/', handleGetCSRActivities);
router.get('/:id', handleGetCSRActivityById);
router.post('/', handleCreateCSRActivity);
router.patch('/:id', handleUpdateCSRActivity);
router.delete('/:id', handleDeleteCSRActivity);
export default router;
