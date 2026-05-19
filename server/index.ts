import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import dotenv from 'dotenv';
dotenv.config({ override: true });
import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/connectDB.js';
import AuthRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import UserRoutes from './routes/user.route.js';
import InterviewRoutes from './routes/interview.route.js';
import ReportRoutes from './routes/report.route.js';
import PaymentRoutes from './routes/payment.route.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// All routes
app.use('/api/auth', AuthRoutes);
app.use('/api/interview', InterviewRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/report', ReportRoutes);
app.use('/api/payment', PaymentRoutes);


// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Evelify API is running with TypeScript..." });
});

// 404 Handler - MUST BE LAST
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
