import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';

dotenv.config ();
connectDB ();

const app = express ();

app.use (
  cors ({
    origin: [
      'http://localhost:5173',
      'https://spend-wise-opal.vercel.app', // ✅ CORRECT DOMAIN
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ IMPORTANT: allow preflight
app.options ('*', cors ());

app.use (express.json ());

app.use ('/api/auth', authRoutes);
app.use ('/api/transactions', transactionRoutes);
app.use ('/api/budgets', budgetRoutes);

const PORT = process.env.PORT || 5000;
app.listen (PORT, () => {
  console.log (`Server running on port ${PORT}`);
});
console.log ('Transaction routes mounted at /api/transactions');
