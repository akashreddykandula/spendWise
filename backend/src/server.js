// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from './config/db.js';

// import authRoutes from './routes/authRoutes.js';
// import transactionRoutes from './routes/transactionRoutes.js';
// import budgetRoutes from './routes/budgetRoutes.js';

// dotenv.config ();
// connectDB ();

// const app = express ();

// app.use (express.json ());

// app.use ('/api/auth', authRoutes);
// app.use ('/api/transactions', transactionRoutes);
// app.use ('/api/budgets', budgetRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen (PORT, () => {
//   console.log (`Server running on port ${PORT}`);
// });

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

/* ✅ SAFE CORS (NO wildcard routes) */
app.use (
  cors ({
    origin: [
      'http://localhost:5173',
      'https://spend-wise-gamma-two.vercel.app',
      'https://spend-wise-opal.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use (express.json ());

/* ✅ API ROUTES */
app.use ('/api/auth', authRoutes);
app.use ('/api/transactions', transactionRoutes);
app.use ('/api/budgets', budgetRoutes);

/* ✅ Health check (IMPORTANT for Render) */
app.get ('/', (req, res) => {
  res.send ('SpendWise API running 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen (PORT, () => console.log (`🚀 Server running on port ${PORT}`));
