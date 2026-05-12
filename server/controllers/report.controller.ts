import { Request, Response } from 'express';
import InterviewSession from '../models/interviewSession.model.js';
import InterviewReport from '../models/interviewReport.model.js';
import { evaluateInterviewAnswers } from '../services/aiEvaluation.service.js';

export const generateInterviewReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.body;
        const userId = req.id;

        if (!sessionId) {
            res.status(400).json({ success: false, message: "Session ID is required" });
            return;
        }

        // Check if report already exists
        let report = await InterviewReport.findOne({ interviewId: sessionId, userId });
        if (report) {
            res.status(200).json({ success: true, report });
            return;
        }

        const session = await InterviewSession.findById(sessionId);
        if (!session) {
            res.status(404).json({ success: false, message: "Session not found" });
            return;
        }

        if (session.userId.toString() !== userId) {
            res.status(403).json({ success: false, message: "Unauthorized" });
            return;
        }

        if (session.status !== 'completed') {
            res.status(400).json({ success: false, message: "Interview is not completed yet" });
            return;
        }

        // Generate evaluation
        const evaluationData = await evaluateInterviewAnswers(session);

        // Save report
        report = new InterviewReport({
            interviewId: session._id,
            userId: session.userId,
            evaluations: evaluationData.evaluations,
            averageScore: evaluationData.overall.averageScore,
            finalCredits: evaluationData.overall.finalCredits,
            recommendation: evaluationData.overall.recommendation,
            strengths: evaluationData.overall.overallStrengths,
            weaknesses: evaluationData.overall.overallWeaknesses,
            analytics: {
                communication: evaluationData.overall.communicationScore,
                technical: evaluationData.overall.technicalScore,
                confidence: evaluationData.overall.confidenceScore,
                problemSolving: evaluationData.overall.problemSolvingScore,
                behavioral: evaluationData.overall.behavioralScore
            }
        });

        await report.save();

        res.status(200).json({ success: true, report });

    } catch (error: any) {
        console.error("Generate Report Error:", error);
        res.status(500).json({ success: false, message: "Error generating report", error: error.message });
    }
};

export const getInterviewReportById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.id;

        // Try to find by report ID or interview ID
        let report = await InterviewReport.findById(id);
        
        if (!report) {
            // Try by interview ID
            report = await InterviewReport.findOne({ interviewId: id });
        }

        if (!report) {
            res.status(404).json({ success: false, message: "Report not found" });
            return;
        }

        if (report.userId.toString() !== userId) {
            res.status(403).json({ success: false, message: "Unauthorized" });
            return;
        }

        res.status(200).json({ success: true, report });

    } catch (error: any) {
        console.error("Get Report Error:", error);
        res.status(500).json({ success: false, message: "Error fetching report" });
    }
};
