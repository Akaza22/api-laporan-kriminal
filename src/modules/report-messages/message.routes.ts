import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  getMessages,
  postMessage,
} from './message.controller';

const router = Router();

router.get(
  '/reports/:reportId/messages',
  authMiddleware,
  getMessages
);

router.post(
  '/reports/:reportId/messages',
  authMiddleware,
  postMessage
);

export default router;
