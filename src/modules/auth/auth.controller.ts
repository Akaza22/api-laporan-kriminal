import { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schema';
import { registerUser, loginUser } from './auth.services';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/appError';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const user = await registerUser(
    data.full_name,
    data.email,
    data.password,
    data.phone
  );

  res.status(201).json({
    message: 'User registered',
    user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const token = await loginUser(data.email, data.password);

  res.json({
    message: 'Login success',
    token,
  });
});
