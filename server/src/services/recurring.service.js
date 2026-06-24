import { pool, query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';
import { getCategory } from './category.service.js';
import { advanceDate } from '../utils/recurrence.js';

function mapRecurring(row) {
  return {
    id: row.id,
    amount: parseFloat(row.amount),
    type: row.type,
    categoryId: row.category_id,
    category: row.category_name
      ? {
          id: row.category_id,
          name: row.category_name,
          color: row.category_color,
          icon: row.category_icon,
        }
      : undefined,
    frequency: row.frequency,
    notes: row.notes,
    startDate: row.start_date,
    nextDate: row.next_date,
    endDate: row.end_date,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_WITH_CATEGORY = `
  SELECT r.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
  FROM recurring_transactions r
  JOIN categories c ON c.id = r.category_id
`;

export async function listRecurring(userId) {
  const result = await query(
    `${SELECT_WITH_CATEGORY} WHERE r.user_id = $1 ORDER BY r.is_active DESC, r.next_date ASC`,
    [userId]
  );
  return result.rows.map(mapRecurring);
}

export async function getRecurring(userId, id) {
  const result = await query(`${SELECT_WITH_CATEGORY} WHERE r.id = $1 AND r.user_id = $2`, [
    id,
    userId,
  ]);
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'Recurring transaction not found');
  }
  return mapRecurring(result.rows[0]);
}

export async function createRecurring(userId, data) {
  const category = await getCategory(userId, data.categoryId);
  if (category.type !== data.type) {
    throw createError(400, 'TYPE_MISMATCH', 'Category type must match transaction type');
  }

  const nextDate = data.startDate;
  const result = await query(
    `INSERT INTO recurring_transactions
      (user_id, category_id, amount, type, frequency, notes, start_date, next_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [
      userId,
      data.categoryId,
      data.amount,
      data.type,
      data.frequency,
      data.notes || null,
      data.startDate,
      nextDate,
      data.endDate || null,
    ]
  );
  return getRecurring(userId, result.rows[0].id);
}

export async function updateRecurring(userId, id, data) {
  const existing = await getRecurring(userId, id);
  const type = data.type ?? existing.type;
  const categoryId = data.categoryId ?? existing.categoryId;

  if (data.categoryId || data.type) {
    const category = await getCategory(userId, categoryId);
    if (category.type !== type) {
      throw createError(400, 'TYPE_MISMATCH', 'Category type must match transaction type');
    }
  }

  const fields = [];
  const values = [];
  let i = 1;

  const fieldMap = {
    amount: 'amount',
    type: 'type',
    categoryId: 'category_id',
    frequency: 'frequency',
    startDate: 'start_date',
    nextDate: 'next_date',
    endDate: 'end_date',
    notes: 'notes',
    isActive: 'is_active',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${i++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return existing;

  fields.push('updated_at = NOW()');
  values.push(id, userId);

  await query(
    `UPDATE recurring_transactions SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i + 1}`,
    values
  );
  return getRecurring(userId, id);
}

export async function deleteRecurring(userId, id) {
  const result = await query(
    'DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'Recurring transaction not found');
  }
}

export async function processDueRecurring(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const due = await query(
    `SELECT * FROM recurring_transactions
     WHERE user_id = $1 AND is_active = true AND next_date <= $2
     ORDER BY next_date ASC`,
    [userId, today]
  );

  if (due.rows.length === 0) {
    return { processed: 0, transactions: [] };
  }

  const client = await pool.connect();
  const created = [];

  try {
    await client.query('BEGIN');

    for (const row of due.rows) {
      let nextDate = row.next_date;
      const endDate = row.end_date;

      while (nextDate <= today) {
        const txnResult = await client.query(
          `INSERT INTO transactions (user_id, category_id, amount, type, transaction_date, notes)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            userId,
            row.category_id,
            row.amount,
            row.type,
            nextDate,
            row.notes ? `${row.notes} (recurring)` : 'Recurring transaction',
          ]
        );
        created.push(txnResult.rows[0].id);

        nextDate = advanceDate(nextDate, row.frequency);

        if (endDate && nextDate > endDate) {
          await client.query(
            `UPDATE recurring_transactions SET is_active = false, next_date = $1, updated_at = NOW()
             WHERE id = $2`,
            [nextDate, row.id]
          );
          break;
        }
      }

      if (endDate && nextDate > endDate) continue;

      await client.query(
        `UPDATE recurring_transactions SET next_date = $1, updated_at = NOW() WHERE id = $2`,
        [nextDate, row.id]
      );
    }

    await client.query('COMMIT');
    return { processed: created.length, transactions: created };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
