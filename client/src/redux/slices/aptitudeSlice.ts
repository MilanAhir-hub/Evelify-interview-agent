import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { QuestionData, AnswerRecord, ResultData } from '../../types/aptitude';

export type TestStatus = 'idle' | 'fetching' | 'ready' | 'in_progress' | 'submitting' | 'completed';

interface AptitudeState {
  questions: QuestionData[];
  currentQuestionIndex: number;
  answers: AnswerRecord[];
  testStatus: TestStatus;
  result: ResultData | null;
  error: string | null;
}

const initialState: AptitudeState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  testStatus: 'idle',
  result: null,
  error: null,
};

const aptitudeSlice = createSlice({
  name: 'aptitude',
  initialState,
  reducers: {
    setFetching: (state) => {
      state.testStatus = 'fetching';
      state.error = null;
    },

    setQuestions: (state, action: PayloadAction<QuestionData[]>) => {
      state.questions = action.payload;
      state.answers = action.payload.map((q) => ({
        questionId: q._id,
        selectedOption: null,
        isCorrect: null,
      }));
      state.currentQuestionIndex = 0;
      state.testStatus = 'ready';
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.testStatus = 'idle';
      state.error = action.payload;
    },

    startTest: (state) => {
      state.testStatus = 'in_progress';
    },

    answerQuestion: (
      state,
      action: PayloadAction<{ questionIndex: number; selectedOption: string }>
    ) => {
      const { questionIndex, selectedOption } = action.payload;
      const answer = state.answers[questionIndex];
      if (answer.selectedOption !== null) return;

      const question = state.questions[questionIndex];
      const isCorrect = question.correctAnswer === selectedOption;

      state.answers[questionIndex] = {
        questionId: question._id,
        selectedOption,
        isCorrect,
      };
    },

    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },

    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },

    setSubmitting: (state) => {
      state.testStatus = 'submitting';
    },

    setResult: (state, action: PayloadAction<ResultData>) => {
      state.result = action.payload;
      state.testStatus = 'completed';
    },

    resetTest: () => initialState,
  },
});

export const {
  setFetching,
  setQuestions,
  setError,
  startTest,
  answerQuestion,
  nextQuestion,
  previousQuestion,
  setSubmitting,
  setResult,
  resetTest,
} = aptitudeSlice.actions;

export default aptitudeSlice.reducer;
