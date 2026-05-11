import express from 'express';
import upload from '../middlewares/multer.js';
import { analyzeResume } from '../controllers/interview.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.post('/resume/analyze', isAuthenticated, upload.single('resume'), analyzeResume);

export default router;