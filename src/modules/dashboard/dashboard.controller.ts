import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/appError';
import { getDashboardAnalytics } from './dashboard.service';

export const dashboardAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    

    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }

    const data = await getDashboardAnalytics();

    res.json({
      status: 'success',
      data,
    });
  }
);
