import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { getLatestUsersService, getUserById } from './user.service';
import { AppError } from '../../utils/appError';

export const getLatestUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;

    const sort = (req.query.sort as string) || 'created_at:desc';
    const [sortField, rawSortOrder] = sort.split(':');

    // 🔐 TYPE NARROWING DI SINI
    const sortOrder: 'asc' | 'desc' =
      rawSortOrder === 'asc' ? 'asc' : 'desc';

    const users = await getLatestUsersService({
      limit,
      sortField,
      sortOrder,
    });

    res.json({
      status: 'success',
      data: users,
    });
  }
);

export const getUserDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const idParam = req.params.id;

    if (typeof idParam !== 'string') {
      throw new AppError('Invalid user id', 400);
    }

    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = req.user.userId === idParam;

    if (!isAdmin && !isOwner) {
      throw new AppError('Forbidden', 403);
    }

    const user = await getUserById(idParam);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: user,
    });
  }
);

