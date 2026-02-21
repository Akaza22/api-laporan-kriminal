import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { 
  getLatestUsersService, 
  getUserById, 
  getUsersPaginated, 
  getUserReports, 
  updateUserStatus,
  updateUserRole,
  softDeleteUser,
  restoreUser,
 } from './user.service';
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

export const getUsers = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      status,
      role,
    } = req.query;

    const result = await getUsersPaginated({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      status: status as string,
      role: role as string,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('GET USERS ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

export const getUserReportsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const result = await getUserReports(
      id as string,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('GET USER REPORTS ERROR:', error);

    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reports',
    });
  }
};

export const updateUserStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_active must be boolean',
      });
    }

    const updatedUser = await updateUserStatus(
      id,
      is_active
    );

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('UPDATE USER STATUS ERROR:', error);

    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

export const updateUserRoleController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    // Validasi role
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role value',
      });
    }

    // ❌ Admin tidak boleh ubah role dirinya sendiri
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    const updatedUser = await updateUserRole(id, role);

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('UPDATE USER ROLE ERROR:', error);

    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
    });
  }
};

export const deleteUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    // ❌ Admin tidak boleh hapus dirinya sendiri
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const deletedUser = await softDeleteUser(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser,
    });
  } catch (error: any) {
    console.error('DELETE USER ERROR:', error);

    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'User not found or already deleted',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

export const restoreUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const user = await restoreUser(id);

    return res.status(200).json({
      message: 'User restored successfully',
      data: user,
    });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND_OR_NOT_DELETED') {
      return res.status(404).json({
        message: 'User not found or not deleted',
      });
    }

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

