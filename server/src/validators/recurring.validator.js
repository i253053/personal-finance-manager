import { z } from 'zod';

const frequencyEnum = z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']);

export const createRecurringSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive(),
    type: z.enum(['income', 'expense']),
    categoryId: z.string().uuid(),
    frequency: frequencyEnum,
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const updateRecurringSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    amount: z.coerce.number().positive().optional(),
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().uuid().optional(),
    frequency: frequencyEnum.optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    isActive: z.boolean().optional(),
    nextDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});

export const recurringIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
