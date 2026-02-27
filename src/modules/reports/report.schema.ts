import { z } from 'zod';

export const createReportSchema = z.object({
  category_id: z.string().uuid(),
  description: z.string().min(3),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  incident_time: z.string(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'IN_PROGRESS',
    'ON_HOLD',
    'RESOLVED',
    'REJECTED',
  ]),
});
