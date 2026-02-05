import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminOnly } from '../../middlewares/role.middleware';
import { dashboardAnalytics } from './dashboard.controller';

const router = Router();

router.get(
  '/analytics',
  authMiddleware,
  adminOnly,
  dashboardAnalytics
);

export default router;
