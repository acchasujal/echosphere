import { Router } from 'express';
import {
  handleCreateParticipation,
  handleDeleteParticipation,
  handleGetParticipationById,
  handleGetParticipations,
  handleUpdateParticipation,
} from '../controllers/participation.controller.js';

const router = Router();

router.get('/', handleGetParticipations);
router.get('/:id', handleGetParticipationById);
router.post('/', handleCreateParticipation);
router.patch('/:id', handleUpdateParticipation);
router.delete('/:id', handleDeleteParticipation);

export default router;
