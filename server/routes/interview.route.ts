import express from 'express';
import upload from '../middlewares/multer.js';
import { analyzeResume, generateQuestions, getSession, submitAnswer, getInterviewHistory } from '../controllers/interview.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { validateBody, interviewGenSchema, answerSubmitSchema } from '../middlewares/validation.middleware.js';

const router = express.Router();
console.log("Interview Routes Registered");

router.post('/generate', isAuthenticated, validateBody(interviewGenSchema), generateQuestions);
router.post('/resume/analyze', isAuthenticated, upload.single('resume'), analyzeResume);
router.get('/session/:id', isAuthenticated, getSession);
router.post('/session/:id/answer', isAuthenticated, validateBody(answerSubmitSchema), submitAnswer);
router.get('/history', isAuthenticated, getInterviewHistory);
router.get('/test', (req, res) => res.json({ success: true, message: "Interview router is working" }));

export default router;