import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/appError';
import {
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema
} from './category.schema';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  updateCategoryStatus
} from './category.service';


/* ============================
   CREATE (ADMIN)
============================ */
export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError('Forbidden', 403);
  }

  const data = createCategorySchema.parse(req.body);

  try {
    const category = await createCategory(
      data.name,
      data.description
    );

    res.status(201).json({
      message: 'Category created',
      data: category
    });
  } catch (err: any) {
    if (err.code === '23505') {
      throw new AppError('Category name already exists', 400);
    }
    throw err;
  }
});


/* ============================
   GET ALL
============================ */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { search, is_active, page, limit } = req.query;

  const categories = await getAllCategories(
    search as string,
    is_active !== undefined ? is_active === 'true' : undefined,
    page ? Number(page) : 1,
    limit ? Number(limit) : 10
  );

  res.json({
    success: true,
    ...categories
  });
});


/* ============================
   GET DETAIL
============================ */
export const getDetail = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (typeof id !== 'string') {
    throw new AppError('Invalid category id', 400);
  }

  const category = await getCategoryById(id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.json({
    success: true,
    data: category
  });
});


/* ============================
   UPDATE (ADMIN)
============================ */
export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError('Forbidden', 403);
  }

  const id = req.params.id;

  if (typeof id !== 'string') {
    throw new AppError('Invalid category id', 400);
  }

  const data = updateCategorySchema.parse(req.body);

  const category = await updateCategory(
    id,
    data.name,
    data.description
  );

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.json({
    message: 'Category updated',
    data: category
  });
});


/* ============================
   DELETE (ADMIN)
============================ */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError('Forbidden', 403);
  }

  const id = req.params.id;

  if (typeof id !== 'string') {
    throw new AppError('Invalid category id', 400);
  }

  try {
    await deleteCategory(id);

    res.json({
      message: 'Category deleted'
    });
  } catch (err: any) {
    if (err.message === 'CATEGORY_IN_USE') {
      throw new AppError(
        'Category is used by reports',
        400
      );
    }
    throw err;
  }
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError('Forbidden', 403);
  }

  const id = req.params.id;

  if (typeof id !== 'string') {
    throw new AppError('Invalid category id', 400);
  }

  const data = updateCategoryStatusSchema.parse(req.body);

  const category = await updateCategoryStatus(
    id,
    data.is_active
  );

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.json({
    message: 'Category status updated',
    data: category,
  });
});