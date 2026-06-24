import { z } from 'zod';

export const createGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    targetAmount: z.coerce.number().positive(),
    currentAmount: z.coerce.number().min(0).default(0),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  }),
});

export const updateGoalSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    targetAmount: z.coerce.number().positive().optional(),
    currentAmount: z.coerce.number().min(0).optional(),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  }),
});

export const contributeSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    amount: z.coerce.number().positive(),
  }),
});

export const goalIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
