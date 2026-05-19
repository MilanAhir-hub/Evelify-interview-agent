import { askAi, Message } from './openRouter.service.js';
import { IInterviewSession } from '../models/interviewSession.model.js';

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
Provide a comprehensive evaluation of the candidate. For EACH question, evaluate the candidate's answer and generate the IDEAL answer they should have given. Then provide overall analytics.

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
  }
}
`;

        const messages: Message[] = [
            {
                role: 'system',
                content: 'You are an expert AI interview evaluator. You only output strictly valid JSON.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ];

        const response = await askAi(messages);

        if (!response) {
            throw new Error('Failed to get response from AI');
        }

        // Step 1: Strip markdown fences if the model wrapped the JSON
        let jsonStr = response.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
        }

        // Step 2: Extract the outermost { ... } block
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        try {
            return JSON.parse(jsonStr);
        } catch (parseError: any) {
            console.error("[AI:ERROR] JSON Parse Failed.");
            console.error("[AI:ERROR] Message:", parseError.message);
            console.error("[AI:ERROR] Cleaned string (first 100):", jsonStr.substring(0, 100));
            console.error("[AI:ERROR] Cleaned string (last 100):", jsonStr.substring(jsonStr.length - 100));
            
            // Log char codes around error if position is known
            const posMatch = parseError.message.match(/at position (\d+)/);
            if (posMatch) {
                const pos = parseInt(posMatch[1]);
                const start = Math.max(0, pos - 10);
                const end = Math.min(jsonStr.length, pos + 10);
                const snippet = jsonStr.substring(start, end);
                console.error(`[AI:ERROR] Context around pos ${pos}: "${snippet}"`);
            }

            throw new Error("AI returned malformed data that could not be parsed.");
        }

    } catch (error: any) {
        console.error("AI Evaluation Service Error:", error.message);
        throw error;
    }
};
