import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminOnly } from '../../middlewares/role.middleware';
import {
  create,
  myReports,
  allReports,
  updateStatus,
} from './report.controller';

const router = Router();

// USER
router.post('/', authMiddleware, create);
router.get('/me', authMiddleware, myReports);

// ADMIN
router.get('/', authMiddleware, adminOnly, allReports);
router.patch('/:id/status', authMiddleware, adminOnly, updateStatus);

export default router;
