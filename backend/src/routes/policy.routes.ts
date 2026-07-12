import { Router } from 'express';
import {
  handleCreatePolicy,
  handleDeletePolicy,
  handleGetPolicies,
  handleGetPolicyById,
  handleUpdatePolicy,
} from '../controllers/policy.controller.js';

const router = Router();

router.get('/', handleGetPolicies);
router.get('/:id', handleGetPolicyById);
router.post('/', handleCreatePolicy);
router.patch('/:id', handleUpdatePolicy);
router.delete('/:id', handleDeletePolicy);

export default router;
