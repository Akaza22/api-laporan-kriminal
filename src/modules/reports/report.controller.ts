import { Request, Response } from 'express';
import {
  createReportSchema,
  updateStatusSchema,
} from './report.schema';
import {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
} from './report.service';

export const create = async (req: Request, res: Response) => {
  const data = createReportSchema.parse(req.body);
  const report = await createReport(req.user!.userId, data);

  res.status(201).json({
    message: 'Report submitted',
    report,
  });
};

export const myReports = async (req: Request, res: Response) => {
  const reports = await getMyReports(req.user!.userId);
  res.json(reports);
};

export const allReports = async (_: Request, res: Response) => {
  const reports = await getAllReports();
  res.json(reports);
};

export const updateStatus = async (req: Request, res: Response) => {
  const data = updateStatusSchema.parse(req.body);

  const reportId = req.params.id;
  if (typeof reportId !== 'string') {
    return res.status(400).json({ message: 'Invalid report id' });
  }

  const report = await updateReportStatus(reportId, data.status);

  res.json({
    message: 'Status updated',
    report,
  });
};

