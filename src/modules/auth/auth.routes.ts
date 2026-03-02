import { Router } from 'express';
import { changePasswordController, login, register, } from './auth.controller';
import { loginLimiter } from '../../middlewares/rateLimiter';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);

router.patch(
  '/change-password',
  authMiddleware,
  changePasswordController
);

export default router;
