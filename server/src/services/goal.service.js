import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

function mapGoal(row) {
  const target = parseFloat(row.target_amount);
  const current = parseFloat(row.current_amount);
  const percentComplete = target > 0 ? Math.round((current / target) * 1000) / 10 : 0;

  return {
    id: row.id,
    name: row.name,
    targetAmount: target,
    currentAmount: current,
    targetDate: row.target_date,
    percentComplete,
    isComplete: current >= target,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listGoals(userId) {
  const result = await query(
    `SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows.map(mapGoal);
}

export async function getGoal(userId, id) {
  const result = await query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [id, userId]);
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'Goal not found');
  }
  return mapGoal(result.rows[0]);
}

export async function createGoal(userId, data) {
  const result = await query(
    `INSERT INTO goals (user_id, name, target_amount, current_amount, target_date)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, data.name, data.targetAmount, data.currentAmount ?? 0, data.targetDate || null]
  );
  return mapGoal(result.rows[0]);
}

export async function updateGoal(userId, id, data) {
  await getGoal(userId, id);

  const fields = [];
  const values = [];
  let i = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${i++}`);
    values.push(data.name);
  }
  if (data.targetAmount !== undefined) {
    fields.push(`target_amount = $${i++}`);
    values.push(data.targetAmount);
  }
  if (data.currentAmount !== undefined) {
    fields.push(`current_amount = $${i++}`);
    values.push(data.currentAmount);
  }
  if (data.targetDate !== undefined) {
    fields.push(`target_date = $${i++}`);
    values.push(data.targetDate);
  }

  if (fields.length === 0) {
    return getGoal(userId, id);
  }

  fields.push('updated_at = NOW()');
  values.push(id, userId);

  const result = await query(
    `UPDATE goals SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`,
    values
  );
  return mapGoal(result.rows[0]);
}

export async function contributeToGoal(userId, id, amount) {
  const goal = await getGoal(userId, id);
  const newAmount = goal.currentAmount + amount;
  return updateGoal(userId, id, { currentAmount: newAmount });
}

export async function deleteGoal(userId, id) {
  const result = await query('DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id', [
    id,
    userId,
  ]);
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'Goal not found');
  }
}
