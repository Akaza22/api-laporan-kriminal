import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import { authMiddleware } from '../middlewares/auth.middleware';

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


export default router;
