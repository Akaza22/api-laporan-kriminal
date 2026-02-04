import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/appError';
import {
  getMessagesByReport,
  createMessage,
} from './message.service';

export const getMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const reportId = req.params.reportId;

    if (typeof reportId !== 'string') {
      throw new AppError('Invalid report id', 400);
    }

    const messages = await getMessagesByReport(reportId);

    res.json({
      success: true,
      messages,
    });
  }
);

export const postMessage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const reportId = req.params.reportId;
    if (typeof reportId !== 'string') {
      throw new AppError('Invalid report id', 400);
    }

    const { message, close } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    const result = await createMessage({
      reportId,
      senderId: req.user.userId,
      senderRole: req.user.role,
      message,
      close,
    });

    res.status(201).json({
      success: true,
      message: result,
    });
  }
);
