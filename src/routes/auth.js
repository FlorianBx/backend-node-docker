import { Router } from 'express';
import { register, login, getUsers } from '../controllers/authController.js';
import authenticateToken from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticateToken, getUsers);

export default router;
