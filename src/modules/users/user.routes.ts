import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminOnly } from '../../middlewares/role.middleware';
import { getLatestUsers, getUserDetail, getUsers, getUserReportsController, updateUserStatusController, updateUserRoleController, deleteUserController, restoreUserController } from './user.controller';

const router = Router();

router.get(
  '/latest',
  authMiddleware,
  adminOnly,
  getLatestUsers
);

router.get(
  '/:id',
  authMiddleware,
  getUserDetail
);

router.get(
  '/',
  authMiddleware,
  adminOnly,
  getUsers
);

router.get(
  '/:id/reports',
  authMiddleware,
  adminOnly,
  getUserReportsController
);

router.patch(
  '/:id/status',
  authMiddleware,
  adminOnly,
  updateUserStatusController
);

router.patch(
  '/:id/role',
  authMiddleware,
  adminOnly,
  updateUserRoleController
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  deleteUserController
);

router.patch(
  '/:id/restore', 
  authMiddleware,
  adminOnly,
  restoreUserController);

export default router;
