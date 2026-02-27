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
  getReportDetailById,
  claimReport
} from './report.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/appError';


/* =====================================================
   CREATE REPORT (USER)
===================================================== */
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


/* =====================================================
   GET MY REPORTS (USER)
===================================================== */
export const myReports = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const reports = await getMyReports(req.user.userId);

  res.json({ reports });
});


/* =====================================================
   GET ALL REPORTS (ADMIN - PAGINATED + FILTER CLAIM)
===================================================== */
export const allReports = asyncHandler(
  async (req: Request, res: Response) => {

    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }

    const status = req.query.status as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const search = req.query.search as string | undefined;
    const assigned = req.query.assigned as 'unclaimed' | 'mine' | undefined;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllReportsPaginated(
      status,
      startDate,
      endDate,
      search,
      assigned,
      assigned === 'mine' ? req.user.userId : undefined,
      page,
      limit
    );

    res.json({
      success: true,
      ...result,
    });
  }
);


/* =====================================================
   UPDATE STATUS (ONLY CLAIMING ADMIN)
===================================================== */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {

  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError('Forbidden', 403);
  }

  const data = updateStatusSchema.parse(req.body);

  const reportId = req.params.id;

  if (typeof reportId !== 'string') {
    throw new AppError('Invalid report id', 400);
  }

  const report = await updateReportStatus(
    reportId,
    data.status,
    req.user.userId
  );

  res.json({
    message: 'Status updated',
    report,
  });
});


/* =====================================================
   GET REPORT DETAIL
===================================================== */
export const getReportDetail = asyncHandler(
  async (req: Request, res: Response) => {

    const id = req.params.id;

    if (typeof id !== 'string') {
      throw new AppError('Invalid report id', 400);
    }

    const report = await getReportDetailById(id);

    if (!report) {
      throw new AppError('Report not found', 404);
    }

    res.json({
      status: 'success',
      data: report,
    });
  }
);


/* =====================================================
   CLAIM REPORT (ADMIN ONLY)
===================================================== */
export const claimReportController = asyncHandler(
  async (req: Request, res: Response) => {

    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }

    const id = req.params.id;

    if (typeof id !== 'string') {
      throw new AppError('Invalid report id', 400);
    }

    try {
      const report = await claimReport(id, req.user.userId);

      res.status(200).json({
        message: 'Report claimed successfully',
        data: report,
      });

    } catch (error: any) {

      if (error.message === 'ALREADY_CLAIMED') {
        throw new AppError(
          'Report already claimed by another admin',
          400
        );
      }

      throw error;
    }
  }
);