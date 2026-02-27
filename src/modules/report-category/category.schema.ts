import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(3, 'Name minimal 3 karakter'),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
});

export const updateCategoryStatusSchema = z.object({
  is_active: z.boolean(),
});