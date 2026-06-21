import api from './axiosConfig';
import type { GetQuestionsResponse, SubmitTestResponse } from '../types/aptitude';

export const aptitudeApi = {
  getQuestions: async (category?: string): Promise<GetQuestionsResponse> => {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await api.get<GetQuestionsResponse>(`/aptitude/questions${params}`);
    return response.data;
  },

  submitTest: async (answers: { questionId: string; selectedOption: string }[], timeTaken: number): Promise<SubmitTestResponse> => {
    const response = await api.post<SubmitTestResponse>('/aptitude/submit', { answers, timeTaken });
    return response.data;
  },
};
