import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askAiJson } from '../services/openRouter.service.js';
import { evaluateInterviewAnswers } from '../services/aiEvaluation.service.js';
import { z } from 'zod';

const testSchema = z.object({
  score: z.number().min(0).max(10),
  recommendation: z.enum(['Hire', 'No Hire'])
});

let mockCompletionResponses: string[] = [];
let mockCompletionIndex = 0;

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: async () => {
            const resp = mockCompletionResponses[mockCompletionIndex] || '';
            mockCompletionIndex++;
            return {
              choices: [{
                message: {
                  content: resp
                }
              }]
            };
          }
        }
      };
    }
  };
});

describe('AI Evaluation Service Tests', () => {
  beforeEach(() => {
    mockCompletionResponses = [];
    mockCompletionIndex = 0;
    vi.clearAllMocks();
  });

  describe('askAiJson Parser & Retry Logic', () => {
    it('should successfully parse valid JSON response', async () => {
      mockCompletionResponses = [JSON.stringify({ score: 8, recommendation: 'Hire' })];

      const res = await askAiJson([], testSchema);
      expect(res).toEqual({ score: 8, recommendation: 'Hire' });
      expect(mockCompletionIndex).toBe(1);
    });

    it('should strip markdown code blocks and parse JSON successfully', async () => {
      mockCompletionResponses = ['```json\n{\n  "score": 7,\n  "recommendation": "Hire"\n}\n```'];

      const res = await askAiJson([], testSchema);
      expect(res).toEqual({ score: 7, recommendation: 'Hire' });
      expect(mockCompletionIndex).toBe(1);
    });

    it('should extract JSON embedded in surrounding text', async () => {
      mockCompletionResponses = ['Sure, here is your json: {"score": 9, "recommendation": "Hire"} Hope it helps!'];

      const res = await askAiJson([], testSchema);
      expect(res).toEqual({ score: 9, recommendation: 'Hire' });
      expect(mockCompletionIndex).toBe(1);
    });

    it('should retry once if first attempt fails validation, and succeed if second attempt returns valid JSON', async () => {
      mockCompletionResponses = [
        'invalid-json', // First attempt fails
        JSON.stringify({ score: 6, recommendation: 'Hire' }) // Second attempt succeeds
      ];

      const res = await askAiJson([], testSchema);
      expect(res).toEqual({ score: 6, recommendation: 'Hire' });
      expect(mockCompletionIndex).toBe(2);
    });

    it('should fail and throw an error if both attempts fail validation', async () => {
      mockCompletionResponses = [
        'invalid-json-1',
        'invalid-json-2'
      ];

      await expect(askAiJson([], testSchema)).rejects.toThrow('AI JSON validation failed after retry');
      expect(mockCompletionIndex).toBe(2);
    });
  });

  describe('evaluateInterviewAnswers Integration', () => {
    it('should build messages and validate evaluation responses', async () => {
      const mockSession: any = {
        role: 'Software Engineer',
        experience: 'Mid-level',
        skills: ['React', 'TypeScript'],
        questions: [{ text: 'What is JSX?', type: 'technical' }],
        answers: [{ questionIndex: 0, text: 'JSX is syntax extension.', timeSpent: 30 }]
      };

      const mockAiResponse = {
        evaluations: [
          {
            question: 'What is JSX?',
            userAnswer: 'JSX is syntax extension.',
            aiIdealAnswer: 'JSX is an XML-like syntax extension to JavaScript used in React.',
            score: 8,
            feedback: 'Good brief explanation.',
            improvement: 'Explain virtual DOM mapping.'
          }
        ],
        overall: {
          communicationScore: 80,
          technicalScore: 85,
          confidenceScore: 75,
          problemSolvingScore: 90,
          behavioralScore: 80,
          finalCredits: 82,
          averageScore: 8,
          recommendation: 'Hire',
          overallStrengths: ['Clear communications'],
          overallWeaknesses: ['Needs more technical depth']
        },
        improvementPlan: [
          {
            topic: 'React Core Concept',
            resources: ['React documentation'],
            description: 'Study component lifecycle and virtual DOM.'
          }
        ]
      };

      mockCompletionResponses = [JSON.stringify(mockAiResponse)];

      const res = await evaluateInterviewAnswers(mockSession);
      expect(res.evaluations).toHaveLength(1);
      expect(res.overall.recommendation).toBe('Hire');
      expect(res.improvementPlan).toHaveLength(1);
      expect(mockCompletionIndex).toBe(1);
    });
  });
});
