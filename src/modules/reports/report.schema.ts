import { z } from 'zod';

export const createReportSchema = z.object({
  category: z.string().min(3),
  description: z.string().min(10),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  incident_time: z.string().optional(), // ISO string
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'VERIFIED',
    'IN_PROGRESS',
    'ON_HOLD',
    'RESOLVED',
    'REJECTED',
  ]),
});
