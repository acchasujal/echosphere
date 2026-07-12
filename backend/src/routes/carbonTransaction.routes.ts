import { Router } from 'express';
import {
  handleCreateCarbonTransaction,
  handleDeleteCarbonTransaction,
  handleGetCarbonTransactionById,
  handleGetCarbonTransactions,
  handleUpdateCarbonTransaction,
} from '../controllers/carbonTransaction.controller.js';

const router = Router();

router.get('/', handleGetCarbonTransactions);
router.get('/:id', handleGetCarbonTransactionById);
router.post('/', handleCreateCarbonTransaction);
router.patch('/:id', handleUpdateCarbonTransaction);
router.delete('/:id', handleDeleteCarbonTransaction);

export default router;
