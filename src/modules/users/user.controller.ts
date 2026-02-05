import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { getLatestUsersService } from './user.service';

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
