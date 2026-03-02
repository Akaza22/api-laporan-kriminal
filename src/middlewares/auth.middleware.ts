import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/health'
  ];

  if (publicPaths.includes(req.originalUrl)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as any;

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
