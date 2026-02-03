import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // PostgreSQL error
  if ((err as any).code === '23505') {
    statusCode = 409;
    message = 'Duplicate data';
  }

  // Multer error
  if ((err as any).code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
  }

  if (err.name === 'JsonWebTokenError') {
  statusCode = 401;
  message = 'Invalid token';
}

if (err.name === 'TokenExpiredError') {
  statusCode = 401;
  message = 'Token expired';
}


  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack,
    }),
  });
};
