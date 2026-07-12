import { Router } from 'express';
import {
  handleCreateChallenge,
  handleDeleteChallenge,
  handleGetChallengeById,
  handleGetChallenges,
  handleUpdateChallenge,
} from '../controllers/challenge.controller.js';

const router = Router();

router.get('/', handleGetChallenges);
router.get('/:id', handleGetChallengeById);
router.post('/', handleCreateChallenge);
router.patch('/:id', handleUpdateChallenge);
router.delete('/:id', handleDeleteChallenge);

export default router;
