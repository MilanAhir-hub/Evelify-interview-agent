import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  text: string;
  type: string; // e.g., 'technical', 'behavioral', 'project-based'
}

export interface IAnswer {
  questionIndex: number;
  text: string;
  timeSpent: number; // in seconds
}

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  experience: string;
  skills: string[];
  projects: string[];
  questions: IQuestion[];
  answers: IAnswer[];
  currentQuestionIndex: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    skills: [{ type: String }],
    projects: [{ type: String }],
    questions: [
      {
        text: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
    answers: [
      {
        questionIndex: { type: Number, required: true },
        text: { type: String, required: true },
        timeSpent: { type: Number, required: true },
      },
    ],
    currentQuestionIndex: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
