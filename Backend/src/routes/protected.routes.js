import { Router } from 'express';
import { getProtectedData } from '../controllers/protected.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/protected', authenticateToken, getProtectedData);

export default router;