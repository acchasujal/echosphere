import { Router } from 'express';
import {
  handleCreateAudit,
  handleDeleteAudit,
  handleGetAuditById,
  handleGetAudits,
  handleUpdateAudit,
} from '../controllers/audit.controller.js';

const router = Router();

router.get('/', handleGetAudits);
router.get('/:id', handleGetAuditById);
router.post('/', handleCreateAudit);
router.patch('/:id', handleUpdateAudit);
router.delete('/:id', handleDeleteAudit);

export default router;
