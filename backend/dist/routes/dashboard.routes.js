import { Router } from 'express';
import { handleGetDashboard, handleGetEsgScores } from '../controllers/dashboard.controller.js';
const router = Router();
router.get('/', handleGetDashboard);
router.get('/esg', handleGetEsgScores);
export default router;
