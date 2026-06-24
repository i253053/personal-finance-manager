import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';
import { getCategory } from './category.service.js';

function budgetStatus(percent) {
  if (percent >= 100) return 'over';
  if (percent >= 80) return 'warning';
  return 'ok';
}

function mapBudget(row) {
  const spent = parseFloat(row.spent || 0);
  const amount = parseFloat(row.amount);
  const percentUsed = amount > 0 ? Math.round((spent / amount) * 1000) / 10 : 0;

  return {
    id: row.id,
    categoryId: row.category_id,
    category: {
      id: row.category_id,
      name: row.category_name,
      color: row.category_color,
      icon: row.category_icon,
    },
    month: row.month,
    year: row.year,
    amount,
    spent,
    percentUsed,
    status: budgetStatus(percentUsed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const BUDGET_QUERY = `
  SELECT b.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
    COALESCE((
      SELECT SUM(t.amount)
      FROM transactions t
      WHERE t.category_id = b.category_id
        AND t.user_id = b.user_id
        AND t.type = 'expense'
        AND EXTRACT(MONTH FROM t.transaction_date) = b.month
        AND EXTRACT(YEAR FROM t.transaction_date) = b.year
    ), 0) AS spent
  FROM budgets b
  JOIN categories c ON c.id = b.category_id
  WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
  ORDER BY c.name
`;

export async function listBudgets(userId, month, year) {
  const result = await query(BUDGET_QUERY, [userId, month, year]);
  return result.rows.map(mapBudget);
}

const BUDGET_BY_ID_QUERY = `
  SELECT b.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
    COALESCE((
      SELECT SUM(t.amount)
      FROM transactions t
      WHERE t.category_id = b.category_id
        AND t.user_id = b.user_id
        AND t.type = 'expense'
        AND EXTRACT(MONTH FROM t.transaction_date) = b.month
        AND EXTRACT(YEAR FROM t.transaction_date) = b.year
    ), 0) AS spent
  FROM budgets b
  JOIN categories c ON c.id = b.category_id
  WHERE b.user_id = $1 AND b.id = $2
`;

export async function getBudget(userId, id) {
  const result = await query(BUDGET_BY_ID_QUERY, [userId, id]);
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'Budget not found');
  }
  return mapBudget(result.rows[0]);
}

export async function createBudget(userId, data) {
  const category = await getCategory(userId, data.categoryId);
  if (category.type !== 'expense') {
    throw createError(400, 'INVALID_CATEGORY', 'Budgets can only be set for expense categories');
  }

  try {
    const result = await query(
      `INSERT INTO budgets (user_id, category_id, month, year, amount)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, data.categoryId, data.month, data.year, data.amount]
    );
    return getBudget(userId, result.rows[0].id);
  } catch (err) {
    if (err.code === '23505') {
      throw createError(409, 'DUPLICATE', 'Budget already exists for this category and month');
    }
    throw err;
  }
}

export async function updateBudget(userId, id, { amount }) {
  const result = await query(
    `UPDATE budgets SET amount = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 RETURNING id`,
    [amount, id, userId]
  );
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'Budget not found');
  }
  return getBudget(userId, id);
}

export async function deleteBudget(userId, id) {
  const result = await query('DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id', [
    id,
    userId,
  ]);
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'Budget not found');
  }
}

export async function copyBudgets(userId, { fromMonth, fromYear, toMonth, toYear }) {
  const source = await listBudgets(userId, fromMonth, fromYear);
  const created = [];

  for (const budget of source) {
    try {
      const result = await query(
        `INSERT INTO budgets (user_id, category_id, month, year, amount)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, category_id, month, year) DO NOTHING
         RETURNING id`,
        [userId, budget.categoryId, toMonth, toYear, budget.amount]
      );
      if (result.rows.length > 0) {
        created.push(await getBudget(userId, result.rows[0].id));
      }
    } catch {
      // skip duplicates
    }
  }

  return created;
}
