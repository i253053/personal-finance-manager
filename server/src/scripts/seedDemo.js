import { pool, query } from '../config/db.js';
import { hashPassword } from '../utils/jwt.js';
import { seedDefaultCategories } from '../utils/seedCategories.js';

const DEMO_EMAIL = 'demo@financeapp.com';
const DEMO_PASSWORD = 'Demo1234';

export async function seedDemoData() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [DEMO_EMAIL]);
    let userId;

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      await client.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM goals WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM recurring_transactions WHERE user_id = $1', [userId]);
      console.log('Resetting existing demo user data...');
    } else {
      const passwordHash = await hashPassword(DEMO_PASSWORD);
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, display_name)
         VALUES ($1, $2, 'Demo User') RETURNING id`,
        [DEMO_EMAIL, passwordHash]
      );
      userId = userResult.rows[0].id;
      await seedDefaultCategories(client, userId);
      console.log('Created demo user.');
    }

    const cats = await client.query(
      `SELECT id, name, type FROM categories WHERE user_id = $1`,
      [userId]
    );
    const catMap = Object.fromEntries(cats.rows.map((c) => [c.name, c.id]));

    const now = new Date();
    const transactions = [];

    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();

      transactions.push(
        { cat: 'Salary', type: 'income', amount: 5200, day: 15, month, year, notes: 'Paycheck' },
        { cat: 'Housing', type: 'expense', amount: 1200, day: 1, month, year, notes: 'Rent' },
        { cat: 'Food & Dining', type: 'expense', amount: 180 + m * 20, day: 8, month, year, notes: 'Groceries' },
        { cat: 'Food & Dining', type: 'expense', amount: 65, day: 18, month, year, notes: 'Restaurants' },
        { cat: 'Transportation', type: 'expense', amount: 95, day: 10, month, year, notes: 'Gas' },
        { cat: 'Entertainment', type: 'expense', amount: 45, day: 20, month, year, notes: 'Streaming' },
        { cat: 'Shopping', type: 'expense', amount: 120 + m * 15, day: 22, month, year, notes: 'Misc shopping' },
        { cat: 'Utilities', type: 'expense', amount: 85, day: 5, month, year, notes: 'Electric' }
      );
    }

    for (const t of transactions) {
      const categoryId = catMap[t.cat];
      if (!categoryId) continue;
      const date = `${t.year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}`;
      await client.query(
        `INSERT INTO transactions (user_id, category_id, amount, type, transaction_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, categoryId, t.amount, t.type, date, t.notes]
      );
    }

    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const budgets = [
      { cat: 'Food & Dining', amount: 500 },
      { cat: 'Shopping', amount: 300 },
      { cat: 'Transportation', amount: 200 },
      { cat: 'Housing', amount: 1200 },
      { cat: 'Entertainment', amount: 100 },
    ];

    for (const b of budgets) {
      const categoryId = catMap[b.cat];
      if (!categoryId) continue;
      await client.query(
        `INSERT INTO budgets (user_id, category_id, month, year, amount)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, category_id, month, year) DO UPDATE SET amount = $5`,
        [userId, categoryId, currentMonth, currentYear, b.amount]
      );
    }

    const goals = [
      { name: 'Emergency Fund', target: 10000, current: 3500, monthsAhead: 6 },
      { name: 'Vacation', target: 2500, current: 800, monthsAhead: 4 },
      { name: 'New Laptop', target: 1500, current: 1500, monthsAhead: 0 },
    ];

    for (const g of goals) {
      const targetDate = g.monthsAhead > 0
        ? new Date(currentYear, now.getMonth() + g.monthsAhead, 1).toISOString().slice(0, 10)
        : null;
      await client.query(
        `INSERT INTO goals (user_id, name, target_amount, current_amount, target_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, g.name, g.target, g.current, targetDate]
      );
    }

    const salaryStart = new Date(currentYear, now.getMonth(), 15).toISOString().slice(0, 10);
    await client.query(
      `INSERT INTO recurring_transactions
        (user_id, category_id, amount, type, frequency, notes, start_date, next_date)
       VALUES ($1, $2, 5200, 'income', 'monthly', 'Paycheck', $3, $3)`,
      [userId, catMap['Salary'], salaryStart]
    );
    await client.query(
      `INSERT INTO recurring_transactions
        (user_id, category_id, amount, type, frequency, notes, start_date, next_date)
       VALUES ($1, $2, 15.99, 'expense', 'monthly', 'Netflix', $3, $3)`,
      [userId, catMap['Entertainment'], salaryStart]
    );

    await client.query('COMMIT');
    console.log('Demo data seeded successfully.');
    console.log(`Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    return { email: DEMO_EMAIL, password: DEMO_PASSWORD };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
