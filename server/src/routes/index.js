import { Router } from 'express';
import { checkConnection } from '../config/db.js';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import categoriesRoutes from './categories.routes.js';
import transactionsRoutes from './transactions.routes.js';
import budgetsRoutes from './budgets.routes.js';
import reportsRoutes from './reports.routes.js';
import goalsRoutes from './goals.routes.js';
import recurringRoutes from './recurring.routes.js';
import devRoutes from './dev.routes.js';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const dbOk = await checkConnection();
    res.json({ status: 'ok', db: dbOk ? 'connected' : 'disconnected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/budgets', budgetsRoutes);
router.use('/reports', reportsRoutes);
router.use('/goals', goalsRoutes);
router.use('/recurring', recurringRoutes);
router.use('/dev', devRoutes);

export default router;
