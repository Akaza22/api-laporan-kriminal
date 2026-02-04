import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/appError';
import { getReportTimelineCursor } from './timeline.service';

export const getTimelineByReport = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const reportId = req.params.reportId;
    if (typeof reportId !== 'string') {
      throw new AppError('Invalid report id', 400);
    }

    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getReportTimelineCursor(
      reportId,
      cursor,
      limit
    );

    res.json({
      success: true,
      data: result.data,
      nextCursor: result.nextCursor,
      hasNext: result.hasNext,
    });
  }
);
