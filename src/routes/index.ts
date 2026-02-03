import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/role.middleware';

const router = Router();

router.use('/auth', authRoutes);




router.get('/', (_, res) => {
  res.json({ message: 'API is running 🚀' });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    message: 'Authorized',
    user: req.user,
  });
});

router.get(
  '/admin-test',
  authMiddleware,
  adminOnly,
  (_, res) => {
    res.json({ message: 'Welcome Admin 👑' });
  }
);

export default router;
