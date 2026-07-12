import { Router } from 'express';
import { handleGetEnvironmentReport, handleGetEsgSummary, handleGetGovernanceReport, handleGetSocialReport, } from '../controllers/report.controller.js';
const router = Router();
router.get('/environment', handleGetEnvironmentReport);
router.get('/social', handleGetSocialReport);
router.get('/governance', handleGetGovernanceReport);
router.get('/esg-summary', handleGetEsgSummary);
export default router;
