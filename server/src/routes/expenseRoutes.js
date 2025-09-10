import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listExpenses, createExpense, updateExpense, deleteExpense, stats, dailyTotals } from '../controllers/expenseController.js';


const router = Router();
router.use(requireAuth);
router.get('/', listExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.get('/stats/month', stats);
router.get('/stats/daily', dailyTotals);
export default router;