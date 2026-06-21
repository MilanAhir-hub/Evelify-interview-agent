import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const authSchema = z.object({
    idToken: z.string().min(1, "idToken is required")
});

export const interviewGenSchema = z.object({
    role: z.string().min(1, "Role is required"),
    experience: z.string().min(1, "Experience is required"),
    projects: z.array(z.string()).min(1, "At least one project is required"),
    skills: z.array(z.string()).min(1, "At least one skill is required")
});

export const answerSubmitSchema = z.object({
    answer: z.string().min(1, "Answer cannot be empty"),
    timeSpent: z.number().nonnegative("Time spent must be a non-negative number")
});

export const paymentCreateSchema = z.object({
    tierId: z.enum(['tier_50', 'tier_100'], {
        errorMap: () => ({ message: "Invalid tier ID. Must be tier_50 or tier_100" })
    })
});

export const paymentVerifySchema = z.object({
    razorpay_order_id: z.string().min(1, "Razorpay order ID is required"),
    razorpay_payment_id: z.string().min(1, "Razorpay payment ID is required"),
    razorpay_signature: z.string().min(1, "Razorpay signature is required"),
    tierId: z.enum(['tier_50', 'tier_100'], {
        errorMap: () => ({ message: "Invalid tier ID. Must be tier_50 or tier_100" })
    })
});

export const aptitudeSubmitSchema = z.object({
    answers: z.array(
        z.object({
            questionId: z.string().min(1, "Question ID is required"),
            selectedOption: z.string().nullable()
        })
    ).min(1, "At least one answer is required"),
    timeTaken: z.number().nonnegative().optional()
});

export const validateBody = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
    try {
        schema.parse(req.body);
        next();
    } catch (error: any) {
        console.error("VALIDATION_ERROR_CAUGHT:", error);
        if (error instanceof ZodError || (error && (error as any).name === 'ZodError')) {
            const zodError = error as ZodError;
            const issues = zodError.issues || (zodError as any).errors || [];
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        }
        next(error);
    }
};
