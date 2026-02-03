import { Request, Response } from 'express';
import { uploadImage } from './upload.service';
import { pool } from '../../config/db';

export const uploadReportImage = async (
  req: Request,
  res: Response
) => {
  const file = req.file;
  const reportId = req.params.reportId;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (typeof reportId !== 'string') {
    return res.status(400).json({ message: 'Invalid report id' });
  }

  const imageUrl = await uploadImage(file);

  await pool.query(
    `
    INSERT INTO report_media (report_id, file_url, file_type)
    VALUES ($1, $2, 'IMAGE')
    `,
    [reportId, imageUrl]
  );

  res.status(201).json({
    message: 'Image uploaded',
    url: imageUrl,
  });
};
