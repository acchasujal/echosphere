import { Router } from 'express';
import {
  handleCreateNotification,
  handleDeleteNotification,
  handleGetEmployeeNotifications,
  handleGetNotificationById,
  handleGetNotifications,
  handleUpdateNotification,
} from '../controllers/notification.controller.js';

const router = Router();

router.get('/', handleGetNotifications);
router.get('/employee/:employeeId', handleGetEmployeeNotifications);
router.get('/:id', handleGetNotificationById);
router.post('/', handleCreateNotification);
router.patch('/:id', handleUpdateNotification);
router.delete('/:id', handleDeleteNotification);

export default router;
