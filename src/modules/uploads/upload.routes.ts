import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { upload } from './multer';
import {
  uploadReportImage,
  uploadMultipleReportImages,
  deleteImage,
} from './upload.controller';

const router = Router();

// single upload
router.post(
  '/reports/:reportId/images',
  authMiddleware,
  upload.single('image'),
  uploadReportImage
);

// multiple upload
router.post(
  '/reports/:reportId/images/multiple',
  authMiddleware,
  upload.array('images', 5),
  uploadMultipleReportImages
);

// delete image
router.delete(
  '/reports/:reportId/images/:imageId',
  authMiddleware,
  deleteImage
);

export default router;
