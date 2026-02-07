import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminOnly } from '../../middlewares/role.middleware';
import { getLatestUsers, getUserDetail } from './user.controller';

const router = Router();

router.get(
  '/',
  authMiddleware,
  adminOnly,
  getLatestUsers
);

router.get(
  '/:id',
  authMiddleware,
  getUserDetail
);

export default router;
