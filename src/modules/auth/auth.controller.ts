import { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schema';
import { registerUser, loginUser, changePassword } from './auth.services';
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

export const changePasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.userId;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    await changePassword(userId, current_password, new_password);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    
    if (error.message === 'INVALID_CURRENT_PASSWORD') {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    if (error.message === 'PASSWORD_MUST_BE_DIFFERENT') {
      return res.status(400).json({
        success: false,
        message: 'New password must be different',
      });
    }

    if (error.message === 'PASSWORD_TOO_SHORT') {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};