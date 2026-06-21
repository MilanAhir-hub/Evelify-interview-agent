import { Request, Response } from "express";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { askAi, askAiJson, Message } from "../services/openRouter.service.js";
import { z } from "zod";
import InterviewSession from "../models/interviewSession.model.js";
import InterviewReport from "../models/interviewReport.model.js";
import User from "../models/user.model.js";

const singleQuestionSchema = z.object({
    text: z.string().min(1, "Question text is required"),
    type: z.enum(['technical', 'project', 'problem-solving', 'behavioral', 'advanced'])
});

interface ResumeData {
    role: string;
    experience: string;
    projects: string[];
    skills: string[];
}

export const analyzeResume = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {

        // Check if file exists
        if (!req.file) {
            res.status(400).json({
                message: "Resume file is required",
                success: false,
            });

            return;
        }

        const filePath = req.file.path;

        // Read PDF file
        const fileBuffer = await fs.promises.readFile(filePath);

        const pdf = await pdfjsLib.getDocument({
            data: new Uint8Array(fileBuffer),
        }).promise;

        let resumeText = "";

        // Extract text from all PDF pages
        for (let i = 1; i <= pdf.numPages; i++) {

            const page = await pdf.getPage(i);

            const textContent = await page.getTextContent();

            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");

            resumeText += `${pageText}\n`;
        }

        // Clean extra spaces
        resumeText = resumeText.replace(/\s+/g, " ").trim();

        const messages: Message[] = [
            {
                role: "system",
                content: `
You are an expert resume analyzer.

Analyze the resume and extract:

- Role
- Experience
- Top 2 Projects
- Skills

Return ONLY valid JSON in this format:

{
  "role": "string",
  "experience": "string",
  "projects": [
    "project 1",
    "project 2"
  ],
  "skills": [
    "skill 1",
    "skill 2"
  ]
}
        `,
            },
            {
                role: "user",
                content: resumeText,
            },
        ];

        // Get AI response
        const response = await askAi(messages);

        // Convert JSON string into object
        const parsed: ResumeData = JSON.parse(response || "{}");

        // Delete uploaded file
        await fs.promises.unlink(filePath);

        // Send final response
        res.status(200).json({
            success: true,
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText,
        });

    } catch (error: any) {

        console.error("Resume Analysis Error:", error.message);

        // Delete file if error occurs
        if (req.file?.path) {
            await fs.promises.unlink(req.file.path).catch(() => { });
        }

        res.status(500).json({
            message: "Error analyzing resume",
            success: false,
        });
    }
};

export const generateQuestions = async (req: Request, res: Response): Promise<void> => {
    console.log("Generate Questions hit", req.body);
    try {
        const userId = req.id;

        // Atomically check and deduct 10 credits
        const user = await User.findOneAndUpdate(
            { _id: userId, credits: { $gte: 10 } },
            { $inc: { credits: -10 } },
            { new: true }
        );

        if (!user) {
            res.status(402).json({ success: false, message: "Insufficient credits or user not found" });
            return;
        }

        const { role, experience, projects, skills } = req.body;

        const messages: Message[] = [
            {
                role: "system",
                content: `You are an expert technical interviewer for top tech companies.
Generate the FIRST interview question personalized for a candidate with:
Role: ${role}
Experience: ${experience}
Skills: ${skills.join(", ")}
Projects: ${projects.join(", ")}

The question MUST be of type 'technical', focusing on core technical concepts and fundamentals relevant to their skills and experience.

Return ONLY valid JSON in this format:
{ "text": "Your question here", "type": "technical" }`
            }
        ];

        let firstQuestion;
        try {
            firstQuestion = await askAiJson(messages, singleQuestionSchema);
        } catch (aiErr: any) {
            console.error("Failed to generate first question:", aiErr);
            // Refund the deducted credits
            await User.findByIdAndUpdate(userId, { $inc: { credits: 10 } });
            res.status(500).json({ success: false, message: "Failed to generate initial question from AI." });
            return;
        }

        const session = new InterviewSession({
            userId,
            role,
            experience,
            projects,
            skills,
            questions: [firstQuestion],
            status: 'in_progress',
            currentQuestionIndex: 0
        });

        await session.save();

        res.status(200).json({ 
            success: true, 
            sessionId: session._id,
        });


    } catch (error: any) {
        console.error("Generate Questions Error:", error);
        res.status(500).json({ success: false, message: "Error generating questions" });
    }
};

export const getSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const session = await InterviewSession.findById(id);

        if (!session) {
            res.status(404).json({ success: false, message: "Session not found" });
            return;
        }

        if (session.userId.toString() !== req.id) {
            res.status(403).json({ success: false, message: "Unauthorized" });
            return;
        }

        res.status(200).json({ success: true, session });
    } catch (error) {
        console.error("Get Session Error:", error);
        res.status(500).json({ success: false, message: "Error fetching session" });
    }
};

export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { answer, timeSpent } = req.body;

        const session = await InterviewSession.findById(id);
        if (!session || session.userId.toString() !== req.id) {
            res.status(404).json({ success: false, message: "Session not found or unauthorized" });
            return;
        }

        if (session.status === 'completed') {
            res.status(400).json({ success: false, message: "Interview already completed" });
            return;
        }

        session.answers.push({
            questionIndex: session.currentQuestionIndex,
            text: answer,
            timeSpent
        });

        session.currentQuestionIndex += 1;

        if (session.currentQuestionIndex >= 5) {
            session.status = 'completed';
        } else {
            // Generate next adaptive question N+1
            const questionTypes = ['technical', 'project', 'problem-solving', 'behavioral', 'advanced'];
            const nextType = questionTypes[session.currentQuestionIndex];

            const previousQAs = session.questions.map((q, idx) => {
                const ans = session.answers.find(a => a.questionIndex === idx);
                return `Question ${idx + 1} (${q.type}): ${q.text}\nCandidate Answer: ${ans ? ans.text : 'No answer provided'}`;
            }).join("\n\n");

            const systemPrompt = `You are conducting an adaptive technical interview for a candidate.
Candidate Profile:
Role: ${session.role}
Experience: ${session.experience}
Skills: ${session.skills.join(", ")}
Projects: ${session.projects.join(", ")}

Interview Transcript so far:
${previousQAs}

INSTRUCTIONS:
Generate the NEXT interview question (Question ${session.currentQuestionIndex + 1} of 5) of type '${nextType}'.
This question should be adaptive: either follow up on the candidate's last answer to drill deeper, correct a misconception, or move to a new topic relevant to their background.

Return ONLY valid JSON in this format:
{
  "text": "Adaptive question text here",
  "type": "${nextType}"
}`;

            const messages: Message[] = [
                {
                    role: "system",
                    content: systemPrompt
                }
            ];

            try {
                const nextQuestion = await askAiJson(messages, singleQuestionSchema);
                session.questions.push(nextQuestion);
            } catch (aiError) {
                console.error("Failed to generate adaptive question:", aiError);
                // Fallback questions to prevent interview blockage
                const fallbackQuestions: Record<string, string> = {
                    'project': "Can you explain a challenging technical problem you solved in one of your projects?",
                    'problem-solving': "How do you approach designing a scalable system or database schema?",
                    'behavioral': "Tell me about a time when you had to resolve a conflict with a team member.",
                    'advanced': "What are some advanced optimization techniques you use in your daily coding work?"
                };
                const fallbackText = fallbackQuestions[nextType] || "Can you tell me more about your technical background?";
                session.questions.push({ text: fallbackText, type: nextType });
            }
        }

        await session.save();

        res.status(200).json({
            success: true,
            status: session.status,
            currentQuestionIndex: session.currentQuestionIndex,
            session
        });

    } catch (error) {
        console.error("Submit Answer Error:", error);
        res.status(500).json({ success: false, message: "Error submitting answer" });
    }
};

export const getInterviewHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const totalCount = await InterviewSession.countDocuments({
            userId,
            status: 'completed'
        });

        const sessions = await InterviewSession.find({
            userId,
            status: 'completed'
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const sessionsWithReports = await Promise.all(
            sessions.map(async (session) => {
                const report = await InterviewReport.findOne({ interviewId: session._id });
                return {
                    _id: session._id,
                    role: session.role,
                    experience: session.experience,
                    skills: session.skills,
                    projects: session.projects,
                    status: session.status,
                    createdAt: session.createdAt,
                    report: report ? {
                        averageScore: report.averageScore,
                        finalCredits: report.finalCredits,
                        recommendation: report.recommendation,
                        strengths: report.strengths,
                        weaknesses: report.weaknesses,
                        analytics: report.analytics
                    } : null
                };
            })
        );

        res.status(200).json({
            success: true,
            data: sessionsWithReports,
            pagination: {
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                limit
            }
        });

    } catch (error) {
        console.error("Get Interview History Error:", error);
        res.status(500).json({ success: false, message: "Error fetching interview history" });
    }
};