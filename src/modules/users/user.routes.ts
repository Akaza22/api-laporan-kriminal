import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminOnly } from '../../middlewares/role.middleware';
import { getLatestUsers, getUserDetail, getUsers, getUserReportsController, updateUserStatusController, updateUserRoleController, deleteUserController, restoreUserController, getProfileController, updateProfileController } from './user.controller';

const router = Router();

/* =========================
   SPECIFIC ROUTES FIRST
========================= */

router.get(
  '/latest',
  authMiddleware,
  adminOnly,
  getLatestUsers
);

router.get(
  '/profile',
  authMiddleware,
  getProfileController
);

router.patch(
  '/profile',
  authMiddleware,
  updateProfileController
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

router.patch(
  '/:id/restore',
  authMiddleware,
  adminOnly,
  restoreUserController
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  deleteUserController
);

/* =========================
   GENERIC ROUTES LAST
========================= */

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

export default router;