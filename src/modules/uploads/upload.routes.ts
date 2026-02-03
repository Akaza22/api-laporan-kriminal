import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { upload } from './multer';
import { uploadReportImage } from './upload.controller';

const router = Router();

router.post(
  '/reports/:reportId/image',
  authMiddleware,
  upload.single('image'),
  uploadReportImage
);

export default router;
