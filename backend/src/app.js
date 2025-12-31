import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express ();

app.use (helmet ());
app.use (express.json ());
app.use (morgan ('dev'));
app.use ('/api/auth', authRoutes);
app.use ('/api/transactions', transactionRoutes);
app.use ('/api/analytics', analyticsRoutes);
app.use ('/api/budgets', budgetRoutes);
app.use ('/api/reports', reportRoutes);
export default app;
