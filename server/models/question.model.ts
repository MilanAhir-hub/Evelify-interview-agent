import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  hint: string;
  explanation?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema(
  {
    questionText: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: [(v: string[]) => v.length === 4, 'Exactly 4 options required'],
    },
    correctAnswer: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    category: { type: String, required: true, index: true },
    hint: { type: String, required: true },
    explanation: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

QuestionSchema.index({ category: 1, difficulty: 1 });
QuestionSchema.index({ isActive: 1, category: 1 });

export default mongoose.model<IQuestion>('Question', QuestionSchema);
