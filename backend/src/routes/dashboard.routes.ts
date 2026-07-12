import { Router } from 'express';
import { handleGetDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', handleGetDashboard);

export default router;