import api from './axiosConfig';

export interface Evaluation {
    question: string;
    userAnswer: string;
    aiIdealAnswer: string;
    score: number;
    feedback: string;
    improvement: string;
}

export interface InterviewReportData {
    _id: string;
    interviewId: string;
    userId: string;
    evaluations: Evaluation[];
    averageScore: number;
    finalCredits: number;
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
    createdAt: string;
}

export const reportApi = {
    generateReport: async (sessionId: string): Promise<{ success: boolean; report?: InterviewReportData; message?: string }> => {
        try {
            console.log('Generating report for session:', sessionId);
            const response = await api.post('/report/generate', { sessionId });
            return response.data;
        } catch (error: any) {
            console.error('Error generating report:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to generate report' };
        }
    },

    getReport: async (id: string): Promise<{ success: boolean; report?: InterviewReportData; message?: string }> => {
        try {
            const response = await api.get(`/report/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching report:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to fetch report' };
        }
    }
};
