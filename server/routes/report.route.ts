import express from 'express';
import { generateInterviewReport, getInterviewReportById } from '../controllers/report.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();
console.log("Report Routes Registered");

router.post('/generate', isAuthenticated, generateInterviewReport);
router.get('/:id', isAuthenticated, getInterviewReportById);

export default router;
