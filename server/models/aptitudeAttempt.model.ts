import mongoose, { Document, Schema } from 'mongoose';

export interface IAttemptQuestion {
  questionId: mongoose.Types.ObjectId;
  selectedOption: string | null;
  isCorrect: boolean | null;
}

export interface IAptitudeAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  questions: IAttemptQuestion[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  percentage: number;
  timeTaken: number;
  status: 'completed' | 'timed_out';
  startedAt: Date;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttemptQuestionSchema: Schema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOption: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
  },
  { _id: false }
);

const AptitudeAttemptSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questions: { type: [AttemptQuestionSchema], required: true },
    score: { type: Number, required: true, default: 0 },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true, default: 0 },
    wrongAnswers: { type: Number, required: true, default: 0 },
    unanswered: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    timeTaken: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['completed', 'timed_out'],
      required: true,
    },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

AptitudeAttemptSchema.index({ userId: 1, createdAt: -1 });
AptitudeAttemptSchema.index({ userId: 1, percentage: -1 });

export default mongoose.model<IAptitudeAttempt>('AptitudeAttempt', AptitudeAttemptSchema);
