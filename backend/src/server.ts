import express from 'express';
import { handleError } from './controllers/employee.controller.js';
import badgeRoutes from './routes/badge.routes.js';
import carbonTransactionRoutes from './routes/carbonTransaction.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import challengeRoutes from './routes/challenge.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import participationRoutes from './routes/participation.routes.js';
import rewardRoutes from './routes/reward.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

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
app.use('/dashboard', dashboardRoutes);
app.use('/carbon-transactions', carbonTransactionRoutes);
app.use('/participations', participationRoutes);
app.use('/badges', badgeRoutes);
app.use('/notifications', notificationRoutes);

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
