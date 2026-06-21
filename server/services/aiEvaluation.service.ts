import { askAiJson, Message } from './openRouter.service.js';
import { IInterviewSession } from '../models/interviewSession.model.js';
import { z } from 'zod';

const evaluationResponseSchema = z.object({
    evaluations: z.array(
        z.object({
            question: z.string(),
            userAnswer: z.string(),
            aiIdealAnswer: z.string(),
            score: z.number().min(0).max(10),
            feedback: z.string(),
            improvement: z.string(),
        })
    ),
    overall: z.object({
        communicationScore: z.number().min(0).max(100),
        technicalScore: z.number().min(0).max(100),
        confidenceScore: z.number().min(0).max(100),
        problemSolvingScore: z.number().min(0).max(100),
        behavioralScore: z.number().min(0).max(100),
        finalCredits: z.number().min(0).max(100),
        averageScore: z.number().min(0).max(10),
        recommendation: z.enum(['Strong Hire', 'Hire', 'Average', 'Needs Improvement']),
        overallStrengths: z.array(z.string()),
        overallWeaknesses: z.array(z.string()),
    }),
    improvementPlan: z.array(
        z.object({
            topic: z.string(),
            resources: z.array(z.string()),
            description: z.string()
        })
    )
});

export const evaluateInterviewAnswers = async (session: IInterviewSession) => {
    try {
        const questionsAndAnswers = session.questions.map((q, index) => {
            const answer = session.answers.find((a) => a.questionIndex === index);
            return `Question ${index + 1} (${q.type}): ${q.text}\nUser Answer: ${answer ? answer.text : 'No answer provided'}\nTime Spent: ${answer ? answer.timeSpent : 0} seconds`;
        }).join('\n\n');

        const prompt = `
You are an elite Tech Recruiter and Senior Engineering Manager. 
You are evaluating a candidate's interview performance based on the following questions and answers.

Candidate Profile:
Role: ${session.role}
Experience: ${session.experience}
Skills: ${session.skills.join(', ')}

Interview Transcript:
${questionsAndAnswers}

INSTRUCTIONS:
Provide a comprehensive evaluation of the candidate. For EACH question, evaluate the candidate's answer and generate the IDEAL answer they should have given. Then provide overall analytics and a detailed personalized study plan/roadmap.

You MUST return ONLY a valid JSON object with the exact following structure. Do not wrap it in markdown block quotes (e.g., \`\`\`json). Return raw JSON only.

{
  "evaluations": [
    {
      "question": "The original question text",
      "userAnswer": "The user's answer",
      "aiIdealAnswer": "The perfect, professional answer to this question",
      "score": <number between 0 and 10>,
      "feedback": "Specific feedback on their answer",
      "improvement": "How they can improve this specific answer"
    }
  ],
  "overall": {
    "communicationScore": <number between 0 and 100>,
    "technicalScore": <number between 0 and 100>,
    "confidenceScore": <number between 0 and 100>,
    "problemSolvingScore": <number between 0 and 100>,
    "behavioralScore": <number between 0 and 100>,
    "finalCredits": <number between 0 and 100, representing the overall percentage>,
    "averageScore": <number between 0 and 10, average of all question scores>,
    "recommendation": "<Must be one of: 'Strong Hire', 'Hire', 'Average', 'Needs Improvement'>",
    "overallStrengths": ["Strength 1", "Strength 2"],
    "overallWeaknesses": ["Weakness 1", "Weakness 2"]
  },
  "improvementPlan": [
    {
      "topic": "Suggested study topic name based on weaknesses",
      "resources": ["Book name, documentation link, or online course resource 1", "Resource 2"],
      "description": "Specific study plan, suggestions, and practice ideas"
    }
  ]
}
`;

        const messages: Message[] = [
            {
                role: 'system',
                content: 'You are an expert AI interview evaluator. You only output strictly valid JSON matching the requested schema.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ];

        const validatedResponse = await askAiJson(messages, evaluationResponseSchema);
        return validatedResponse;

    } catch (error: any) {
        console.error("AI Evaluation Service Error:", error.message);
        throw error;
    }
};
