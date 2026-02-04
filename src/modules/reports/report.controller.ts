import { Request, Response } from 'express';
import {
  createReportSchema,
  updateStatusSchema,
} from './report.schema';
import {
  createReport,
  getMyReports,
  getAllReportsPaginated,
  updateReportStatus,
} from './report.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/appError';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = createReportSchema.parse(req.body);

  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const report = await createReport(req.user.userId, data);

  res.status(201).json({
    message: 'Report submitted',
    report,
  });
});

export const myReports = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const reports = await getMyReports(req.user.userId);

  res.json({ reports });
});

export const allReports = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }

    const status = req.query.status as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const search = req.query.search as string | undefined;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllReportsPaginated(
      status,
      startDate,
      endDate,
      search,
      page,
      limit
    );

    res.json({
      success: true,
      ...result,
    });
  }
);

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = updateStatusSchema.parse(req.body);

  const reportId = req.params.id;
  if (typeof reportId !== 'string') {
    throw new AppError('Invalid report id', 400);
  }

  const report = await updateReportStatus(reportId, data.status);

  res.json({
    message: 'Status updated',
    report,
  });
});
