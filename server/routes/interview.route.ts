import express from 'express';
import upload from '../middlewares/multer.js';
import { analyzeResume, generateQuestions, getSession, submitAnswer } from '../controllers/interview.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();
console.log("Interview Routes Registered");

router.post('/generate', isAuthenticated, generateQuestions);
router.post('/resume/analyze', isAuthenticated, upload.single('resume'), analyzeResume);
router.get('/session/:id', isAuthenticated, getSession);
router.post('/session/:id/answer', isAuthenticated, submitAnswer);
router.get('/test', (req, res) => res.json({ success: true, message: "Interview router is working" }));

export default router;