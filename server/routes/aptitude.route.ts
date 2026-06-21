import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import {
  getQuestions,
  submitTest,
  getAttemptHistory,
  getAttemptById,
} from '../controllers/aptitude.controller.js';
import { validateBody, aptitudeSubmitSchema } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.get('/questions', isAuthenticated, getQuestions);
router.post('/submit', isAuthenticated, validateBody(aptitudeSubmitSchema), submitTest);
router.get('/history', isAuthenticated, getAttemptHistory);
router.get('/attempt/:id', isAuthenticated, getAttemptById);

export default router;
