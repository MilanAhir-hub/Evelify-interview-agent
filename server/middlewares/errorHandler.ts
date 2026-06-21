import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export interface AppError extends Error {
    statusCode?: number;
    status?: number;
    code?: number;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    logger.error(`Captured error: ${err.message}`, err);

    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Internal server error";

    // Handle Multer upload limits error
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = "File size limit exceeded. Resumes must be 5MB or smaller.";
    }

    // Handle mongoose validation / duplicate key
    if (err.name === 'ValidationError') {
        statusCode = 400;
    } else if (err.code === 11000) {
        statusCode = 409;
        message = "Duplicate record already exists.";
    }

    const response: Record<string, any> = {
        success: false,
        message
    };

    if (process.env.NODE_ENV !== 'production' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};
