import { Router } from 'express';
import { googleAuth, logout } from '../controllers/auth.controller.js';
import { validateBody, authSchema } from '../middlewares/validation.middleware.js';

const router = Router();
console.log("Auth Routes Registered");

router.post('/google', validateBody(authSchema), googleAuth);
router.post('/logout', logout);
router.get('/test', (req, res) => {
    res.json({ success: true, message: "Auth router is reachable" });
});

export default router;