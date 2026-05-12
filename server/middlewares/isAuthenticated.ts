import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            id?: string;
        }
    }
}

const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        let token = req.cookies?.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

        if (!decode) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        req.id = decode.id;
        next();

    } catch (error) {
        console.error("Authentication Middleware Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export default isAuthenticated;