import api from './axiosConfig';

export interface ResumeAnalysisResponse {
  success: boolean;
  role: string;
  experience: string;
  projects: string[];
  skills: string[];
  resumeText: string;
}

export const interviewApi = {
  /**
   * Uploads a resume and gets AI-analyzed data
   * @param file The PDF file to upload
   */
  analyzeResume: async (file: File): Promise<ResumeAnalysisResponse> => {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post<ResumeAnalysisResponse>(
        '/interview/resume/analyze',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  },

  generateQuestions: async (data: any) => {
    const response = await api.post('/interview/generate', data);
    return response.data;
  },

  getSession: async (sessionId: string) => {
    const response = await api.get(`/interview/session/${sessionId}`);
    return response.data;
  },

  submitAnswer: async (sessionId: string, answer: string, timeSpent: number) => {
    const response = await api.post(`/interview/session/${sessionId}/answer`, { answer, timeSpent });
    return response.data;
  }
};
