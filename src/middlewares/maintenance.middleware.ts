import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

export const maintenanceGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { rows } = await pool.query(`
    SELECT maintenance_mode
    FROM system_settings
    LIMIT 1
  `);

  const maintenance = rows[0]?.maintenance_mode;

  if (!maintenance) return next();

  // Admin bypass
  if (req.user?.role === 'ADMIN') {
    return next();
  }

  // Allow read-only
  if (req.method === 'GET') {
    return next();
  }

  return res.status(503).json({
    success: false,
    message: 'System is under maintenance',
  });
};