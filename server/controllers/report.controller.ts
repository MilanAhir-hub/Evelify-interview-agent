import { Request, Response } from 'express';
import InterviewSession from '../models/interviewSession.model.js';
import InterviewReport from '../models/interviewReport.model.js';
import { evaluateInterviewAnswers } from '../services/aiEvaluation.service.js';
import User from '../models/user.model.js';


export const generateInterviewReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.body;
        const userId = req.id;

        // --- Guard: sessionId present ---
        if (!sessionId) {
            console.error("[REPORT] sessionId missing from request body");
            res.status(400).json({ success: false, message: "Session ID is required" });
            return;
        }

        // --- Guard: userId from auth middleware ---
        if (!userId) {
            console.error("[REPORT] userId undefined — auth middleware failed");
            res.status(401).json({ success: false, message: "User not authenticated" });
            return;
        }

        // --- STEP 1: Check if report already exists (return it immediately) ---
        const existingReport = await InterviewReport.findOne({ interviewId: sessionId });
        if (existingReport) {
            console.log(`[REPORT] Existing report found for session ${sessionId}, returning it.`);
            res.status(200).json({ success: true, report: existingReport });
            return;
        }

        // --- STEP 2: Fetch and validate the InterviewSession ---
        const session = await InterviewSession.findById(sessionId);
        if (!session) {
            console.error(`[REPORT] InterviewSession not found: ${sessionId}`);
            res.status(404).json({ success: false, message: "Session not found" });
            return;
        }

        if (session.userId.toString() !== userId) {
            console.error(`[REPORT] Ownership mismatch: session.userId=${session.userId}, req.id=${userId}`);
            res.status(403).json({ success: false, message: "Unauthorized" });
            return;
        }

        if (session.status !== 'completed') {
            console.error(`[REPORT] Session status is "${session.status}", expected "completed"`);
            res.status(400).json({ success: false, message: `Interview not completed (status: ${session.status})` });
            return;
        }

        // --- STEP 3: Call AI evaluation ---
        let evaluationData: any;
        try {
            evaluationData = await evaluateInterviewAnswers(session);
        } catch (aiErr: any) {
            console.error("[REPORT] AI evaluation failed:", aiErr.message);
            // Refund the 10 credits deducted at session start
            await User.findByIdAndUpdate(userId, { $inc: { credits: 10 } });
            res.status(500).json({ success: false, message: `AI evaluation failed: ${aiErr.message}` });
            return;
        }

        // --- Guard: validate AI response structure ---
        if (!evaluationData?.evaluations || !evaluationData?.overall) {
            console.error("[REPORT] AI returned invalid structure:", JSON.stringify(evaluationData));
            // Refund the 10 credits deducted at session start
            await User.findByIdAndUpdate(userId, { $inc: { credits: 10 } });
            res.status(500).json({ success: false, message: "AI returned invalid data structure" });
            return;
        }

        const overall = evaluationData.overall;

        // --- Guard: validate recommendation enum ---
        const validRecs = ['Strong Hire', 'Hire', 'Average', 'Needs Improvement'];
        if (!validRecs.includes(overall.recommendation)) {
            console.error(`[REPORT] Invalid recommendation "${overall.recommendation}", defaulting to "Average"`);
            overall.recommendation = 'Average';
        }

        // --- STEP 4: Atomic upsert — prevents E11000 duplicate key error ---
        const reportData = {
            interviewId: session._id,
            userId: session.userId,
            evaluations: evaluationData.evaluations,
            averageScore: overall.averageScore ?? 0,
            finalCredits: overall.finalCredits ?? 0,
            recommendation: overall.recommendation,
            strengths: overall.overallStrengths ?? [],
            weaknesses: overall.overallWeaknesses ?? [],
            analytics: {
                communication: overall.communicationScore ?? 0,
                technical: overall.technicalScore ?? 0,
                confidence: overall.confidenceScore ?? 0,
                problemSolving: overall.problemSolvingScore ?? 0,
                behavioral: overall.behavioralScore ?? 0,
            },
            improvementPlan: evaluationData.improvementPlan ?? []
        };

        let report;
        try {
            report = await InterviewReport.findOneAndUpdate(
                { interviewId: session._id },
                { $set: reportData },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        } catch (dbErr: any) {
            console.error("[REPORT] Database upsert failed:", dbErr.message);
            // Refund the 10 credits deducted at session start
            await User.findByIdAndUpdate(userId, { $inc: { credits: 10 } });
            res.status(500).json({ success: false, message: `Failed to save report: ${dbErr.message}` });
            return;
        }

        console.log(`[REPORT] Report saved successfully. reportId=${report._id}`);
        
        // Fetch user info to send updated credits back to frontend
        const user = await User.findById(userId);
        res.status(200).json({ success: true, report, user });

    } catch (error: any) {
        console.error("[REPORT:FATAL]", error.stack || error.message);
        res.status(500).json({ success: false, message: "Error generating report", error: error.message });
    }
};

export const getInterviewReportById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.id;

        // Try by document _id first, then by interviewId
        let report = await InterviewReport.findById(id).catch(() => null);
        if (!report) {
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
        console.error("[GET_REPORT:FATAL]", error.stack || error.message);
        res.status(500).json({ success: false, message: "Error fetching report" });
    }
};
