import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    icon: row.icon,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

export async function listCategories(userId, type) {
  let sql = 'SELECT * FROM categories WHERE user_id = $1';
  const params = [userId];

  if (type) {
    sql += ' AND type = $2';
    params.push(type);
  }

  sql += ' ORDER BY type, name';
  const result = await query(sql, params);
  return result.rows.map(mapCategory);
}

export async function getCategory(userId, id) {
  const result = await query('SELECT * FROM categories WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'Category not found');
  }
  return mapCategory(result.rows[0]);
}

export async function createCategory(userId, data) {
  try {
    const result = await query(
      `INSERT INTO categories (user_id, name, type, color, icon, is_default)
       VALUES ($1, $2, $3, $4, $5, false) RETURNING *`,
      [userId, data.name, data.type, data.color, data.icon || null]
    );
    return mapCategory(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      throw createError(409, 'DUPLICATE', 'A category with this name already exists');
    }
    throw err;
  }
}

export async function updateCategory(userId, id, data) {
  const existing = await getCategory(userId, id);
  if (existing.isDefault) {
    throw createError(400, 'DEFAULT_CATEGORY', 'Default categories cannot be modified');
  }

  const fields = [];
  const values = [];
  let i = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${i++}`);
    values.push(data.name);
  }
  if (data.color !== undefined) {
    fields.push(`color = $${i++}`);
    values.push(data.color);
  }
  if (data.icon !== undefined) {
    fields.push(`icon = $${i++}`);
    values.push(data.icon);
  }

  if (fields.length === 0) {
    return getCategory(userId, id);
  }

  values.push(id, userId);

  try {
    const result = await query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`,
      values
    );
    return mapCategory(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      throw createError(409, 'DUPLICATE', 'A category with this name already exists');
    }
    throw err;
  }
}

export async function deleteCategory(userId, id, reassignTo) {
  const category = await getCategory(userId, id);
  if (category.isDefault) {
    throw createError(400, 'DEFAULT_CATEGORY', 'Default categories cannot be deleted');
  }

  const txnCount = await query(
    'SELECT COUNT(*)::int AS count FROM transactions WHERE category_id = $1 AND user_id = $2',
    [id, userId]
  );

  if (txnCount.rows[0].count > 0) {
    if (!reassignTo) {
      throw createError(
        400,
        'HAS_TRANSACTIONS',
        'Category has transactions. Provide reassignTo category id.'
      );
    }
    const target = await getCategory(userId, reassignTo);
    if (target.type !== category.type) {
      throw createError(400, 'TYPE_MISMATCH', 'Reassign category must be the same type');
    }
    await query('UPDATE transactions SET category_id = $1 WHERE category_id = $2 AND user_id = $3', [
      reassignTo,
      id,
      userId,
    ]);
  }

  await query('DELETE FROM budgets WHERE category_id = $1 AND user_id = $2', [id, userId]);
  await query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
}
