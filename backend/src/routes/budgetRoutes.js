import express from 'express';
import {protect} from '../middleware/auth.js';
import {
  setMonthlyBudget,
  setCategoryBudgets,
  getBudgets,
} from '../controllers/budgetController.js';

const router = express.Router ();

router.use (protect);

router.get ('/', getBudgets);
router.put ('/monthly', setMonthlyBudget);
router.put ('/categories', setCategoryBudgets);

export default router;
