import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  getUsers,
} from '../controllers/authController.js';
import authenticateToken from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/users', authenticateToken, getUsers);

export default router;
