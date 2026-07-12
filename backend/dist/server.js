import express from 'express';
// @ts-ignore -- cors types not installed; package is present
import cors from 'cors';
import { handleError } from './controllers/employee.controller.js';
import badgeRoutes from './routes/badge.routes.js';
import carbonTransactionRoutes from './routes/carbonTransaction.routes.js';
import complianceIssueRoutes from './routes/complianceIssue.routes.js';
import dashboardInsightsRoutes from './routes/dashboardInsights.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import challengeRoutes from './routes/challenge.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import participationRoutes from './routes/participation.routes.js';
import rewardRoutes from './routes/reward.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reportRoutes from './routes/report.routes.js';
import csrRoutes from './routes/csr.routes.js';
import policyRoutes from './routes/policy.routes.js';
import policyAcknowledgementRoutes from './routes/policyAcknowledgement.routes.js';
import auditRoutes from './routes/audit.routes.js';
const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'OK',
    });
});
app.use('/employees', employeeRoutes);
app.use('/challenges', challengeRoutes);
app.use('/rewards', rewardRoutes);
app.use('/dashboard/insights', dashboardInsightsRoutes);
app.use('/dashboard-insights', dashboardInsightsRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/carbon-transactions', carbonTransactionRoutes);
app.use('/compliance-issues', complianceIssueRoutes);
app.use('/participations', participationRoutes);
app.use('/badges', badgeRoutes);
app.use('/notifications', notificationRoutes);
app.use('/reports', reportRoutes);
app.use('/csr', csrRoutes);
app.use('/policies', policyRoutes);
app.use('/policy-acknowledgements', policyAcknowledgementRoutes);
app.use('/audits', auditRoutes);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found.',
    });
});
app.use(handleError);
const port = Number(process.env.PORT ?? 3000);
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
export default app;
