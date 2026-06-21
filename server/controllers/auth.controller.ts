import { Request, Response } from 'express';
import User from '../models/user.model.js';
import generateToken from '../config/token.js';
import { verifyFirebaseIdToken } from '../utils/verifyFirebaseToken.js';

export const googleAuth = async (req: Request, res: Response): Promise<any> => {
    console.log("Google Auth Controller Hit:", req.body);

    try {
        // 1. Get frontend data
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: "ID token is required" });
        }

        // Verify Firebase ID Token using Google's public keys directly
        let decodedToken;
        try {
            decodedToken = await verifyFirebaseIdToken(idToken);
            console.log("Token verified successfully for:", decodedToken.email);
        } catch (verifyError: any) {
            console.error("Firebase ID Token verification failed:", verifyError.message);
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid Firebase token" });
        }

        const email = decodedToken.email;
        const name = decodedToken.name || email?.split('@')[0] || "User";

        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in token" });
        }

        // 2. Find existing user or create a new one
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({ name, email });
        }

        // 3. Generate JWT Token using config logic
        const token = generateToken(user._id);

        // 4. Save token inside cookies
        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side JS from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Needed for cross-origin if frontend/backend are on different ports
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        // 5. Send success response back to frontend
        return res.status(200).json({
            success: true,
            message: "Authentication successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits,
            }
        });

    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const logout = async (req:Request , res:Response) =>{
    try {
        
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0), // Remove the cookie immediately
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });

        res.status(200).json({ success: true, message: "Logged out successfully" });

    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}