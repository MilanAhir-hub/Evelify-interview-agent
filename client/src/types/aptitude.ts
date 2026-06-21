export interface QuestionData {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  hint: string;
}

export interface AnswerRecord {
  questionId: string;
  selectedOption: string | null;
  isCorrect: boolean | null;
}

export interface ResultData {
  attemptId: string;
  score: number;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  percentage: number;
  performanceLevel: string;
  message: string;
}

export interface GetQuestionsResponse {
  success: boolean;
  data: QuestionData[];
}

export interface SubmitTestResponse {
  success: boolean;
  data: ResultData;
}
