import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  categoryReportSchema,
  summarySchema,
  trendsSchema,
} from '../validators/budget.validator.js';
import { z } from 'zod';

const exportSchema = z.object({
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

const router = Router();

router.use(authenticate);

router.get('/summary', validate(summarySchema), reportController.summary);
router.get('/trends', validate(trendsSchema), reportController.trends);
router.get('/categories', validate(categoryReportSchema), reportController.categories);
router.get('/export', validate(exportSchema), reportController.exportCsv);

export default router;
