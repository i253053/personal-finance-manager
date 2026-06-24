import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email().transform((e) => e.toLowerCase()),
    password: z.string().min(8).regex(/[0-9]/, 'Password must contain at least one number'),
    displayName: z.string().min(1).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().transform((e) => e.toLowerCase()),
    password: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).max(100).optional(),
    currency: z.string().length(3).optional(),
  }),
});
