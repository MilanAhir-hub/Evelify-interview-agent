import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

// Mock Firebase Admin
vi.mock('../config/firebaseAdmin.js', () => {
  return {
    default: {
      auth: () => ({
        verifyIdToken: async () => ({ email: 'test@example.com' })
      })
    }
  };
});

// Mock pdfjsLib
vi.mock('pdfjs-dist/legacy/build/pdf.mjs', () => {
  return {
    default: {
      getDocument: () => ({
        promise: Promise.resolve({
          numPages: 1,
          getPage: async () => ({
            getTextContent: async () => ({
              items: [{ str: 'React developer resume content' }]
            })
          })
        })
      })
    },
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: async () => ({
          getTextContent: async () => ({
            items: [{ str: 'React developer resume content' }]
          })
        })
      })
    })
  };
});

// Mock fs to write dummy uploads or not fail
vi.mock('fs', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    promises: {
      ...actual.promises,
      readFile: async () => Buffer.from('dummy pdf bytes'),
      unlink: async () => {}
    }
  };
});

// Mock connectDB
vi.mock('../config/connectDB.js', () => {
  return {
    default: async () => {}
  };
});

// In-memory mock database
const db: {
  users: Record<string, any>;
  sessions: Record<string, any>;
  reports: Record<string, any>;
} = {
  users: {},
  sessions: {},
  reports: {}
};

// Mock constructable Models
vi.mock('../models/user.model.js', () => {
  const MockUser = function(this: any, data: any) {
    Object.assign(this, data);
    this.save = async () => {
      db.users[this._id] = this;
      return this;
    };
  };
  (MockUser as any).findById = async (id: string) => db.users[id] || null;
  (MockUser as any).findByIdAndUpdate = async (id: string, update: any) => {
    const user = db.users[id];
    if (user && update['$inc']) {
      for (const k in update['$inc']) {
        user[k] = (user[k] || 0) + update['$inc'][k];
      }
    }
    return user;
  };
  (MockUser as any).findOneAndUpdate = async (filter: any, update: any) => {
    const id = filter._id;
    const user = db.users[id];
    if (!user) return null;
    if (filter['credits'] && filter['credits']['$gte']) {
      if (user.credits < filter['credits']['$gte']) {
        return null;
      }
    }
    if (update['$inc']) {
      for (const k in update['$inc']) {
        user[k] = (user[k] || 0) + update['$inc'][k];
      }
    }
    return user;
  };
  return {
    default: MockUser
  };
});

vi.mock('../models/interviewSession.model.js', () => {
  const MockSession = function(this: any, data: any) {
    Object.assign(this, data);
    this._id = 'session_' + Math.random().toString(36).substr(2, 9);
    this.answers = this.answers || [];
    this.questions = this.questions || [];
    this.currentQuestionIndex = this.currentQuestionIndex || 0;
    this.save = async () => {
      db.sessions[this._id] = this;
      return this;
    };
  };
  (MockSession as any).create = async (data: any) => {
    const inst = new (MockSession as any)(data);
    await inst.save();
    return inst;
  };
  (MockSession as any).findById = async (id: string) => db.sessions[id] || null;
  (MockSession as any).countDocuments = async (query: any) => {
    return Object.values(db.sessions).filter((s: any) => s.userId.toString() === query.userId.toString()).length;
  };
  (MockSession as any).find = (query: any) => {
    let list = Object.values(db.sessions);
    if (query) {
      if (query.userId) {
        list = list.filter((s: any) => s.userId.toString() === query.userId.toString());
      }
      if (query.status) {
        list = list.filter((s: any) => s.status === query.status);
      }
    }
    return {
      sort: () => ({
        skip: () => ({
          limit: () => list
        })
      })
    };
  };
  return {
    default: MockSession
  };
});

vi.mock('../models/interviewReport.model.js', () => {
  const MockReport = function(this: any, data: any) {
    Object.assign(this, data);
    this._id = 'report_' + Math.random().toString(36).substr(2, 9);
    this.save = async () => {
      db.reports[this._id] = this;
      return this;
    };
  };
  (MockReport as any).findOne = async (query: any) => {
    if (query.interviewId) {
      return Object.values(db.reports).find((r: any) => r.interviewId === query.interviewId) || null;
    }
    return null;
  };
  (MockReport as any).create = async (data: any) => {
    const inst = new (MockReport as any)(data);
    await inst.save();
    return inst;
  };
  (MockReport as any).findOneAndUpdate = async (filter: any, update: any) => {
    let reportObj = Object.values(db.reports).find((r: any) => r.interviewId === filter.interviewId);
    if (!reportObj) {
      reportObj = new (MockReport as any)({ ...filter, ...update['$set'] });
    } else {
      Object.assign(reportObj, update['$set']);
    }
    db.reports[reportObj._id] = reportObj;
    return reportObj;
  };
  return {
    default: MockReport
  };
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

describe('Complete Interview Workflow Integration Test', () => {
  const userId = 'mock-user-123';
  let token: string;

  beforeEach(() => {
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET!);
    db.users = {
      [userId]: {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        credits: 20
      }
    };
    db.sessions = {};
    db.reports = {};
    mockCompletionResponses = [];
    mockCompletionIndex = 0;
    vi.restoreAllMocks();
  });

  it('should successfully run a full interview cycle', async () => {
    const mockResumeData = {
      role: 'React Developer',
      experience: '2 years',
      projects: ['E-commerce Web App', 'Weather App'],
      skills: ['React', 'CSS', 'JavaScript']
    };

    mockCompletionResponses = [
      // Resume analyze response
      JSON.stringify(mockResumeData),
      // Q1 (generate questions)
      JSON.stringify({ text: 'Explain React hooks.', type: 'technical' }),
      // Q2 (submitAnswer 1)
      JSON.stringify({ text: 'What is useEffect dependency array?', type: 'project' }),
      // Q3 (submitAnswer 2)
      JSON.stringify({ text: 'Tell me about state management.', type: 'problem-solving' }),
      // Q4 (submitAnswer 3)
      JSON.stringify({ text: 'Explain virtual DOM.', type: 'behavioral' }),
      // Q5 (submitAnswer 4)
      JSON.stringify({ text: 'Tell me about a time you solved a bug.', type: 'advanced' }),
      // Report evaluation response
      JSON.stringify({
        evaluations: [
          { question: 'Q1', userAnswer: 'A1', aiIdealAnswer: 'I1', score: 8, feedback: 'F1', improvement: 'Imp1' },
          { question: 'Q2', userAnswer: 'A2', aiIdealAnswer: 'I2', score: 9, feedback: 'F2', improvement: 'Imp2' },
          { question: 'Q3', userAnswer: 'A3', aiIdealAnswer: 'I3', score: 7, feedback: 'F3', improvement: 'Imp3' },
          { question: 'Q4', userAnswer: 'A4', aiIdealAnswer: 'I4', score: 9, feedback: 'F4', improvement: 'Imp4' },
          { question: 'Q5', userAnswer: 'A5', aiIdealAnswer: 'I5', score: 8, feedback: 'F5', improvement: 'Imp5' }
        ],
        overall: {
          communicationScore: 85,
          technicalScore: 80,
          confidenceScore: 90,
          problemSolvingScore: 85,
          behavioralScore: 80,
          finalCredits: 84,
          averageScore: 8.2,
          recommendation: 'Hire',
          overallStrengths: ['Problem solving'],
          overallWeaknesses: ['CSS grids']
        },
        improvementPlan: [
          { topic: 'CSS Layouts', resources: ['MDN'], description: 'Learn CSS flexbox and grids.' }
        ]
      })
    ];

    // Resume analyze API
    const resumeRes = await request(app)
      .post('/api/interview/resume/analyze')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', Buffer.from('dummy resume pdf content'), 'resume.pdf');

    expect(resumeRes.status).toBe(200);
    expect(resumeRes.body.success).toBe(true);
    expect(resumeRes.body.role).toBe('React Developer');

    // 2. Generate questions
    const genQuestionsRes = await request(app)
      .post('/api/interview/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        role: 'React Developer',
        experience: '2 years',
        projects: ['E-commerce Web App'],
        skills: ['React', 'JavaScript']
      });

    expect(genQuestionsRes.status).toBe(200);
    expect(genQuestionsRes.body.success).toBe(true);
    const sessionId = genQuestionsRes.body.sessionId;
    expect(sessionId).toBeDefined();
    expect(db.users[userId].credits).toBe(10); // 10 credits deducted atomically

    // 3. Submit Answers (5 times)
    for (let i = 0; i < 5; i++) {
      const submitRes = await request(app)
        .post(`/api/interview/session/${sessionId}/answer`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          answer: `Mocked answer for question ${i + 1}`,
          timeSpent: 45
        });

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.success).toBe(true);
      if (i < 4) {
        expect(submitRes.body.status).toBe('in_progress');
        expect(submitRes.body.session.answers.length).toBe(i + 1);
      } else {
        expect(submitRes.body.status).toBe('completed');
      }
    }

    // 4. Generate Interview Report
    const reportRes = await request(app)
      .post('/api/report/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionId });

    expect(reportRes.status).toBe(200);
    expect(reportRes.body.success).toBe(true);
    expect(reportRes.body.report.averageScore).toBe(8.2);
    expect(reportRes.body.report.recommendation).toBe('Hire');
    expect(reportRes.body.report.improvementPlan).toHaveLength(1);

    // 5. Fetch history
    const historyRes = await request(app)
      .get('/api/interview/history')
      .set('Authorization', `Bearer ${token}`);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.success).toBe(true);
    expect(historyRes.body.data.length).toBeGreaterThan(0);
  });
});
