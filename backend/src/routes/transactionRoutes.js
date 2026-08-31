import express from 'express';
import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';
import {protect} from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router ();

router.use (protect);

// ➕ Add transaction with receipt
router.post ('/', upload.single ('receipt'), addTransaction);

// 📥 Get all
router.get ('/', getTransactions);

// ✏️ Update with receipt
router.put ('/:id', upload.single ('receipt'), updateTransaction);

// ❌ Delete
router.delete ('/:id', deleteTransaction);

export default router;
