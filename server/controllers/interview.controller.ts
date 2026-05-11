import { Request, Response } from "express";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist";

import { askAi, Message } from "../services/openRouter.service.js";

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