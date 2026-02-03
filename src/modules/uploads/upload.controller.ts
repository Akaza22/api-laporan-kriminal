import { Request, Response } from 'express';
import {
  uploadImage,
  uploadMultipleImages,
  deleteImageFromCloud,
} from './upload.service';
import { pool } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/appError';

// =========================
// SINGLE UPLOAD
// =========================
export const uploadReportImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const file = req.file;
    const reportId = req.params.reportId;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    if (typeof reportId !== 'string') {
      throw new AppError('Invalid report id', 400);
    }

    const { url, publicId } = await uploadImage(file);

    await pool.query(
      `
      INSERT INTO report_media (report_id, file_url, public_id, file_type)
      VALUES ($1, $2, $3, 'IMAGE')
      `,
      [reportId, url, publicId]
    );

    res.status(201).json({
      message: 'Image uploaded',
      url,
    });
  }
);

// =========================
// MULTIPLE UPLOAD
// =========================
export const uploadMultipleReportImages = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const reportId = req.params.reportId;
    if (typeof reportId !== 'string') {
      throw new AppError('Invalid report id', 400);
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const uploadedImages = await uploadMultipleImages(files);

      for (const image of uploadedImages) {
        await client.query(
          `
          INSERT INTO report_media
          (report_id, file_url, public_id, file_type)
          VALUES ($1, $2, $3, 'IMAGE')
          `,
          [reportId, image.url, image.publicId]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Images uploaded',
        images: uploadedImages.map(i => i.url),
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
);

// =========================
// DELETE IMAGE
// =========================
export const deleteImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { imageId } = req.params;

    const { rows } = await pool.query(
      `
      SELECT public_id
      FROM report_media
      WHERE id = $1
      `,
      [imageId]
    );

    if (rows.length === 0) {
      throw new AppError('Image not found', 404);
    }

    const publicId = rows[0].public_id;

    await deleteImageFromCloud(publicId);

    await pool.query(
      `
      DELETE FROM report_media
      WHERE id = $1
      `,
      [imageId]
    );

    res.json({
      message: 'Image deleted successfully',
    });
  }
);
