import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    res.status(200).json({
        success: true,
        status: 'UP',
        dbStatus,
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

export default router;
