import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/role.middleware';
import reportRoutes from '../modules/reports/report.routes';
import uploadRoutes from '../modules/uploads/upload.routes';
import messageRoutes from '../modules/report-messages/message.routes'
import timelineRoutes from '../modules/report-timeline/timeline.routes'
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import userRoutes from "../modules/users/user.routes"
import categoryRoutes from '../modules/report-category/category.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/upload', uploadRoutes);
router.use('/message', messageRoutes);
router.use('/timeline', timelineRoutes)
router.use('/admin/dashboard', dashboardRoutes)
router.use('/users', userRoutes)
router.use('/categories', categoryRoutes)


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
