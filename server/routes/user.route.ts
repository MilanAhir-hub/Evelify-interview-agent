import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import getCurrentUser from '../controllers/user.controller.js';

const router = express.Router();

router.get('/current-user', isAuthenticated, getCurrentUser);

export default router;