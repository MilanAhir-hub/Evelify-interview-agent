import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/user.model.js';
import Razorpay from 'razorpay';

// Pricing tiers mapping (id -> { amount in paise, credits })
const PRICING_TIERS: Record<string, { amount: number, credits: number }> = {
    'tier_50': { amount: 9900, credits: 50 },    // ₹99
    'tier_100': { amount: 14900, credits: 100 }, // ₹149
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tierId } = req.body;
        const userId = req.id;

        if (!tierId || !PRICING_TIERS[tierId]) {
            res.status(400).json({ success: false, message: 'Invalid pricing tier' });
            return;
        }

        const tier = PRICING_TIERS[tierId];

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
        });

        const options = {
            amount: tier.amount,
            currency: 'INR',
            receipt: `order_rcpt_${Date.now()}`
        };


        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            keyId: process.env.RAZORPAY_KEY_ID // Need to send key to frontend for checkout
        });

    } catch (error: any) {
        console.error("Create Order Error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while creating the order"
        });
    }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tierId } = req.body;
        const userId = req.id;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !tierId) {
            res.status(400).json({ success: false, message: 'Missing payment verification details' });
            return;
        }

        const tier = PRICING_TIERS[tierId];
        if (!tier) {
            res.status(400).json({ success: false, message: 'Invalid pricing tier' });
            return;
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update user credits
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }

            user.credits += tier.credits;
            await user.save();

            res.status(200).json({
                success: true,
                message: "Payment successful and credits added",
                credits: user.credits,
                user
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }
    } catch (error: any) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong during payment verification"
        });
    }
};
