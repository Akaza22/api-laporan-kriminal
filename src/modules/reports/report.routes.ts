import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminOnly } from '../../middlewares/role.middleware';
import {
  create,
  myReports,
  allReports,
  updateStatus,
  getReportDetail,
  claimReportController
} from './report.controller';

const router = Router();

// USER
router.post('/', authMiddleware, create);
router.get('/me', authMiddleware, myReports);

// ADMIN
router.get(
  '/reports',
  authMiddleware,
  adminOnly,
  allReports
);

router.get(
  '/:id',
  authMiddleware,
  getReportDetail
);

router.patch('/:id/status', authMiddleware, adminOnly, updateStatus);

router.patch(
  '/:id/claim',
  authMiddleware,
  adminOnly,
  claimReportController
);

export default router;
