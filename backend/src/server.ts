import express from 'express';
import { handleError } from './controllers/employee.controller.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import challengeRoutes from './routes/challenge.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import rewardRoutes from './routes/reward.routes.js';

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
