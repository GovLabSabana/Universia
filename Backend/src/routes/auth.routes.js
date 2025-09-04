import { Router } from 'express';
import { signup, login, logout, getUser } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);

router.get('/user', authenticateToken, getUser);

export default router;