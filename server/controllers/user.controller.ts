import { Request, Response } from "express";
import User from "../models/user.model.js";

const getCurrentUser = async(req: Request , res: Response) =>{
    try {
        const user = await User.findById(req.id);
        return res.status(200).json({success: true, user});
    } catch (error) {
        console.log('failed to get current user')
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export default getCurrentUser;