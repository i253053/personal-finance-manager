import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive(),
    type: z.enum(['income', 'expense']),
    categoryId: z.string().uuid(),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    amount: z.coerce.number().positive().optional(),
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().uuid().optional(),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().uuid().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    search: z.string().optional(),
    sort: z.enum(['date_desc', 'date_asc', 'amount_desc', 'amount_asc']).default('date_desc'),
  }),
});

export const transactionIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
