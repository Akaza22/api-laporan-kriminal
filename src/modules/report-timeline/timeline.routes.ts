import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { getTimelineByReport } from './timeline.controller';

const router = Router();

router.get(
  '/reports/:reportId/timeline',
  authMiddleware,
  getTimelineByReport
);

export default router;
