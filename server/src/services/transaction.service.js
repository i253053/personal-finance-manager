import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';
import { getCategory } from './category.service.js';

function mapTransaction(row) {
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
          type: row.category_type,
        }
      : undefined,
    transactionDate: row.transaction_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SORT_MAP = {
  date_desc: 't.transaction_date DESC, t.created_at DESC',
  date_asc: 't.transaction_date ASC, t.created_at ASC',
  amount_desc: 't.amount DESC',
  amount_asc: 't.amount ASC',
};

export async function listTransactions(userId, filters) {
  const { page, limit, type, categoryId, startDate, endDate, search, sort } = filters;
  const offset = (page - 1) * limit;

  const conditions = ['t.user_id = $1'];
  const params = [userId];
  let i = 2;

  if (type) {
    conditions.push(`t.type = $${i++}`);
    params.push(type);
  }
  if (categoryId) {
    conditions.push(`t.category_id = $${i++}`);
    params.push(categoryId);
  }
  if (startDate) {
    conditions.push(`t.transaction_date >= $${i++}`);
    params.push(startDate);
  }
  if (endDate) {
    conditions.push(`t.transaction_date <= $${i++}`);
    params.push(endDate);
  }
  if (search) {
    conditions.push(`(t.notes ILIKE $${i} OR t.amount::text = $${i + 1})`);
    params.push(`%${search}%`, search);
    i += 2;
  }

  const where = conditions.join(' AND ');
  const orderBy = SORT_MAP[sort] || SORT_MAP.date_desc;

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM transactions t WHERE ${where}`,
    params
  );
  const total = countResult.rows[0].total;

  const dataResult = await query(
    `SELECT t.*, c.name AS category_name, c.color AS category_color,
            c.icon AS category_icon, c.type AS category_type
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${where}
     ORDER BY ${orderBy}
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );

  return {
    data: dataResult.rows.map(mapTransaction),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getTransaction(userId, id) {
  const result = await query(
    `SELECT t.*, c.name AS category_name, c.color AS category_color,
            c.icon AS category_icon, c.type AS category_type
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.id = $1 AND t.user_id = $2`,
    [id, userId]
  );
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'Transaction not found');
  }
  return mapTransaction(result.rows[0]);
}

export async function createTransaction(userId, data) {
  const category = await getCategory(userId, data.categoryId);
  if (category.type !== data.type) {
    throw createError(400, 'TYPE_MISMATCH', 'Category type must match transaction type');
  }

  const result = await query(
    `INSERT INTO transactions (user_id, category_id, amount, type, transaction_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, data.categoryId, data.amount, data.type, data.transactionDate, data.notes || null]
  );

  return getTransaction(userId, result.rows[0].id);
}

export async function updateTransaction(userId, id, data) {
  const existing = await getTransaction(userId, id);
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

  if (data.amount !== undefined) {
    fields.push(`amount = $${i++}`);
    values.push(data.amount);
  }
  if (data.type !== undefined) {
    fields.push(`type = $${i++}`);
    values.push(data.type);
  }
  if (data.categoryId !== undefined) {
    fields.push(`category_id = $${i++}`);
    values.push(data.categoryId);
  }
  if (data.transactionDate !== undefined) {
    fields.push(`transaction_date = $${i++}`);
    values.push(data.transactionDate);
  }
  if (data.notes !== undefined) {
    fields.push(`notes = $${i++}`);
    values.push(data.notes);
  }

  if (fields.length === 0) {
    return existing;
  }

  fields.push('updated_at = NOW()');
  values.push(id, userId);

  await query(
    `UPDATE transactions SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i + 1}`,
    values
  );

  return getTransaction(userId, id);
}

export async function deleteTransaction(userId, id) {
  const result = await query('DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id', [
    id,
    userId,
  ]);
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'Transaction not found');
  }
}

export async function getRecentTransactions(userId, limit = 10) {
  const result = await query(
    `SELECT t.*, c.name AS category_name, c.color AS category_color,
            c.icon AS category_icon, c.type AS category_type
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
     ORDER BY t.transaction_date DESC, t.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows.map(mapTransaction);
}
