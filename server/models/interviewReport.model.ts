import mongoose, { Document, Schema } from 'mongoose';

export interface IEvaluation {
    question: string;
    userAnswer: string;
    aiIdealAnswer: string;
    score: number;
    feedback: string;
    improvement: string;
}

export interface IInterviewReport extends Document {
    interviewId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    evaluations: IEvaluation[];
    averageScore: number;
    finalCredits: number; // Percentage like 85
    recommendation: 'Strong Hire' | 'Hire' | 'Average' | 'Needs Improvement';
    strengths: string[];
    weaknesses: string[];
    analytics: {
        communication: number;
        technical: number;
        confidence: number;
        problemSolving: number;
        behavioral: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const InterviewReportSchema: Schema = new Schema(
    {
        interviewId: { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true, unique: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        evaluations: [
            {
                question: { type: String, required: true },
                userAnswer: { type: String, required: true },
                aiIdealAnswer: { type: String, required: true },
                score: { type: Number, required: true },
                feedback: { type: String, required: true },
                improvement: { type: String, required: true },
            },
        ],
        averageScore: { type: Number, required: true },
        finalCredits: { type: Number, required: true },
        recommendation: {
            type: String,
            enum: ['Strong Hire', 'Hire', 'Average', 'Needs Improvement'],
            required: true,
        },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        analytics: {
            communication: { type: Number, required: true },
            technical: { type: Number, required: true },
            confidence: { type: Number, required: true },
            problemSolving: { type: Number, required: true },
            behavioral: { type: Number, required: true },
        },
    },
    { timestamps: true }
);

export default mongoose.model<IInterviewReport>('InterviewReport', InterviewReportSchema);
