import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { validateBody, paymentCreateSchema, paymentVerifySchema } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.post('/create-order', isAuthenticated, validateBody(paymentCreateSchema), createOrder);
router.post('/verify', isAuthenticated, validateBody(paymentVerifySchema), verifyPayment);

export default router;
