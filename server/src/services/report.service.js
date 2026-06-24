import { query } from '../config/db.js';

export async function getSummary(userId, month, year) {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  const balanceResult = await query(
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
     FROM transactions WHERE user_id = $1`,
    [userId]
  );

  const monthlyResult = await query(
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS monthly_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS monthly_expenses,
      COUNT(*)::int AS transaction_count
     FROM transactions
     WHERE user_id = $1
       AND EXTRACT(MONTH FROM transaction_date) = $2
       AND EXTRACT(YEAR FROM transaction_date) = $3`,
    [userId, m, y]
  );

  const totalIncome = parseFloat(balanceResult.rows[0].total_income);
  const totalExpenses = parseFloat(balanceResult.rows[0].total_expenses);
  const monthlyIncome = parseFloat(monthlyResult.rows[0].monthly_income);
  const monthlyExpenses = parseFloat(monthlyResult.rows[0].monthly_expenses);

  return {
    balance: totalIncome - totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    netSavings: monthlyIncome - monthlyExpenses,
    transactionCount: monthlyResult.rows[0].transaction_count,
    month: m,
    year: y,
  };
}

export async function getTrends(userId, months = 6) {
  const result = await query(
    `SELECT
      TO_CHAR(DATE_TRUNC('month', transaction_date), 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
     FROM transactions
     WHERE user_id = $1
       AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - ($2 - 1) * INTERVAL '1 month'
     GROUP BY DATE_TRUNC('month', transaction_date)
     ORDER BY month ASC`,
    [userId, months]
  );

  return {
    data: result.rows.map((r) => ({
      month: r.month,
      income: parseFloat(r.income),
      expenses: parseFloat(r.expenses),
    })),
  };
}

export async function getCategoryBreakdown(userId, startDate, endDate) {
  const result = await query(
    `SELECT c.id AS category_id, c.name, c.color,
      SUM(t.amount) AS total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1 AND t.type = 'expense'
       AND t.transaction_date BETWEEN $2 AND $3
     GROUP BY c.id, c.name, c.color
     ORDER BY total DESC`,
    [userId, startDate, endDate]
  );

  const grandTotal = result.rows.reduce((sum, r) => sum + parseFloat(r.total), 0);

  return {
    data: result.rows.map((r) => {
      const total = parseFloat(r.total);
      return {
        categoryId: r.category_id,
        name: r.name,
        color: r.color,
        total,
        percent: grandTotal > 0 ? Math.round((total / grandTotal) * 1000) / 10 : 0,
      };
    }),
    grandTotal,
  };
}

export async function exportCsv(userId, startDate, endDate) {
  const result = await query(
    `SELECT t.transaction_date, t.type, c.name AS category, t.amount, t.notes
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
       AND t.transaction_date BETWEEN $2 AND $3
     ORDER BY t.transaction_date DESC`,
    [userId, startDate, endDate]
  );

  const header = 'Date,Type,Category,Amount,Notes\n';
  const rows = result.rows
    .map((r) => {
      const notes = (r.notes || '').replace(/"/g, '""');
      return `${r.transaction_date},${r.type},"${r.category}",${r.amount},"${notes}"`;
    })
    .join('\n');

  return header + rows;
}
