dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/connectDB.js';
import AuthRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import UserRoutes from './routes/user.route.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// All routes
app.use('/api/auth', AuthRoutes);
app.use('/api/user', UserRoutes);


// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Evelify API is running with TypeScript..." });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
