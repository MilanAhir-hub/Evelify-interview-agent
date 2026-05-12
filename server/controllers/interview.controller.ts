import { Request, Response } from "express";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { askAi, Message } from "../services/openRouter.service.js";
import InterviewSession from "../models/interviewSession.model.js";

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
        const { role, experience, projects, skills } = req.body;

        const messages: Message[] = [
            {
                role: "system",
                content: `You are an expert technical interviewer for top tech companies.
Generate EXACTLY 5 interview questions personalized for a candidate with:
Role: ${role}
Experience: ${experience}
Skills: ${skills.join(", ")}
Projects: ${projects.join(", ")}

The questions MUST vary:
1. Technical depth
2. Project-based scenario
3. Problem-solving/Architecture
4. Behavioral
5. Advanced/Specific to their skills

Return ONLY valid JSON in this format:
[
  { "text": "Question 1", "type": "technical" },
  { "text": "Question 2", "type": "project" },
  { "text": "Question 3", "type": "problem-solving" },
  { "text": "Question 4", "type": "behavioral" },
  { "text": "Question 5", "type": "advanced" }
]`
            }
        ];

        const response = await askAi(messages);

        let questions;
        try {
            questions = JSON.parse(response || "[]");
        } catch (e) {
            console.error("Failed to parse AI response:", response);
            res.status(500).json({ success: false, message: "AI returned invalid format." });
            return;
        }

        if (!Array.isArray(questions) || questions.length !== 5) {
            res.status(500).json({ success: false, message: "Failed to generate valid questions." });
            return;
        }

        const session = new InterviewSession({
            userId,
            role,
            experience,
            projects,
            skills,
            questions,
            status: 'in_progress',
            currentQuestionIndex: 0
        });

        await session.save();

        res.status(200).json({ success: true, sessionId: session._id });
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

        if (session.currentQuestionIndex >= session.questions.length) {
            session.status = 'completed';
        }

        await session.save();

        res.status(200).json({
            success: true,
            status: session.status,
            currentQuestionIndex: session.currentQuestionIndex
        });

    } catch (error) {
        console.error("Submit Answer Error:", error);
        res.status(500).json({ success: false, message: "Error submitting answer" });
    }
};