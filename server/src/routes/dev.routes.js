import { Router } from 'express';
import { env } from '../config/env.js';
import { createError } from '../middleware/errorHandler.js';
import { seedDemoData } from '../scripts/seedDemo.js';

const router = Router();

router.post('/seed', async (req, res, next) => {
  try {
    if (env.NODE_ENV === 'production') {
      if (!env.SEED_SECRET) {
        throw createError(403, 'FORBIDDEN', 'Seed endpoint disabled in production');
      }
      if (req.body?.secret !== env.SEED_SECRET) {
        throw createError(403, 'FORBIDDEN', 'Invalid seed secret');
      }
    }

    const credentials = await seedDemoData();
    res.json({
      message: 'Demo data seeded',
      credentials,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
