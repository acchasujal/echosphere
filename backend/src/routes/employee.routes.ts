import { Router } from 'express';
import {
  handleCreateEmployee,
  handleDeleteEmployee,
  handleGetEmployeeById,
  handleGetEmployees,
  handleUpdateEmployee,
} from '../controllers/employee.controller.js';

const router = Router();

router.get('/', handleGetEmployees);
router.get('/:id', handleGetEmployeeById);
router.post('/', handleCreateEmployee);
router.patch('/:id', handleUpdateEmployee);
router.delete('/:id', handleDeleteEmployee);

export default router;
