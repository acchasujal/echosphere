import { Router } from 'express';
import {
  handleCreateComplianceIssue,
  handleDeleteComplianceIssue,
  handleGetComplianceIssueById,
  handleGetComplianceIssues,
  handleGetOverdueComplianceIssues,
  handleUpdateComplianceIssue,
} from '../controllers/complianceIssue.controller.js';

const router = Router();

router.get('/', handleGetComplianceIssues);
router.get('/overdue', handleGetOverdueComplianceIssues);
router.get('/:id', handleGetComplianceIssueById);
router.post('/', handleCreateComplianceIssue);
router.patch('/:id', handleUpdateComplianceIssue);
router.delete('/:id', handleDeleteComplianceIssue);

export default router;