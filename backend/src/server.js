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

const allowedOrigins = [
  'http://localhost:5173',
  'https://spend-wise-gamma-two.vercel.app',
  'https://spend-wise-opal.vercel.app',
];

app.use (
  cors ({
    origin: function (origin, callback) {
      // allow Postman / server-to-server
      if (!origin) return callback (null, true);

      if (allowedOrigins.includes (origin)) {
        callback (null, true);
      } else {
        callback (new Error ('CORS not allowed'));
      }
    },
    credentials: true,
  })
);
app.options ('*', cors ());

app.use (express.json ());

app.use ('/api/auth', authRoutes);
app.use ('/api/transactions', transactionRoutes);
app.use ('/api/budgets', budgetRoutes);

const PORT = process.env.PORT || 5000;
app.listen (PORT, () => {
  console.log (`Server running on port ${PORT}`);
});
