import { Request, Response } from 'express';
import { getSystemSettings, updateSystemSettings } from './system.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/appError';


export const getSystemSettingsController = async (req: Request, res: Response) => {
  const data = await getSystemSettings();

  res.json({
    success: true,
    data,
  });
};

export const updateSystemSettingsController = async (req: Request, res: Response) => {
  try {
    const { maintenance_mode, max_upload_size } = req.body;

    const data = await updateSystemSettings({
      maintenance_mode,
      max_upload_size,
    });

    res.json({
      success: true,
      message: 'System settings updated',
      data,
    });
  } catch (error: any) {
    if (error.message === 'NO_FIELDS_TO_UPDATE') {
      return res.status(400).json({
        success: false,
        message: 'No fields provided',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};