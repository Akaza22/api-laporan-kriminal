import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminOnly } from '../../middlewares/role.middleware';
import { getSystemSettingsController, updateSystemSettingsController } from './system.controller';




const router = Router();


router.get(
  '/settings',
  authMiddleware,
  adminOnly,
  getSystemSettingsController
);

router.patch(
  '/settings',
  authMiddleware,
  adminOnly,
  updateSystemSettingsController
);

export default router;