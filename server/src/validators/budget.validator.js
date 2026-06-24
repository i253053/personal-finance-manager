import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020),
    amount: z.coerce.number().positive(),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    amount: z.coerce.number().positive(),
  }),
});

export const listBudgetsSchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020),
  }),
});

export const copyBudgetsSchema = z.object({
  body: z.object({
    fromMonth: z.coerce.number().int().min(1).max(12),
    fromYear: z.coerce.number().int().min(2020),
    toMonth: z.coerce.number().int().min(1).max(12),
    toYear: z.coerce.number().int().min(2020),
  }),
});

export const budgetIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const summarySchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2020).optional(),
  }),
});

export const trendsSchema = z.object({
  query: z.object({
    months: z.coerce.number().int().min(1).max(24).default(6),
  }),
});

export const categoryReportSchema = z.object({
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});
