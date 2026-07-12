import { Router } from 'express';
import { handleGetDashboardInsights } from '../controllers/dashboardInsights.controller.js';

const router = Router();

router.get('/', (req, res, next) => {
  console.log('[AI Insights] Route hit:', req.method, req.originalUrl);
  void handleGetDashboardInsights(req, res, next);
});

export default router;
