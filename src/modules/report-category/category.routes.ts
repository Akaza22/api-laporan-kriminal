import { Router } from 'express';
import * as controller from './category.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminOnly } from '../../middlewares/role.middleware';

const router = Router();

router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getDetail);

router.post('/', authMiddleware, adminOnly, controller.create);
router.patch('/:id', authMiddleware, adminOnly, controller.update);
router.delete('/:id', authMiddleware, adminOnly, controller.remove);
router.patch(
  '/:id/status',
  authMiddleware,
  adminOnly,
  controller.updateStatus
);

export default router;