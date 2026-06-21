import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import dotenv from 'dotenv';
dotenv.config({ override: true });
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import connectDB from './config/connectDB.js';
import AuthRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import UserRoutes from './routes/user.route.js';
import InterviewRoutes from './routes/interview.route.js';
import ReportRoutes from './routes/report.route.js';
import PaymentRoutes from './routes/payment.route.js';
import AptitudeRoutes from './routes/aptitude.route.js';
import HealthRoutes from './routes/health.route.js';
import { errorHandler } from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiters Configuration
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const resumeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many resume uploads, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const interviewGenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many interview requests, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const reportGenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many report generation requests, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many payment operations, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, { ip: req.ip });
  next();
});

// All routes
app.use('/api/auth', authLimiter, AuthRoutes);
app.use('/api/interview/resume/analyze', resumeLimiter);
app.use('/api/interview/generate', interviewGenLimiter);
app.use('/api/interview', InterviewRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/report/generate', reportGenLimiter);
app.use('/api/report', ReportRoutes);
app.use('/api/payment', paymentLimiter, PaymentRoutes);
app.use('/api/aptitude', AptitudeRoutes);
app.use('/api/health', HealthRoutes);


// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Evelify API is running with TypeScript..." });
});

// 404 Handler - MUST BE LAST
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
  });
}

export { app };
export default app;
