import { pool, query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';
import {
  comparePassword,
  getRefreshExpiry,
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { seedDefaultCategories } from '../utils/seedCategories.js';

function mapUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    currency: row.currency,
    createdAt: row.created_at,
  };
}

export async function register({ email, password, displayName }) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw createError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3) RETURNING *`,
      [email, passwordHash, displayName]
    );
    const user = userResult.rows[0];
    await seedDefaultCategories(client, user.id);
    await client.query('COMMIT');

    const tokens = await issueTokens(user.id);
    return { user: mapUser(user), ...tokens };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function login({ email, password }) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !(await comparePassword(password, user.password_hash))) {
    throw createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const tokens = await issueTokens(user.id);
  return { user: mapUser(user), ...tokens };
}

async function issueTokens(userId) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshExpiry();

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return { accessToken, refreshToken };
}

export async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw createError(401, 'INVALID_TOKEN', 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const result = await query(
    `SELECT * FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2 AND expires_at > NOW()`,
    [tokenHash, payload.sub]
  );

  if (result.rows.length === 0) {
    throw createError(401, 'INVALID_TOKEN', 'Invalid or expired refresh token');
  }

  const accessToken = signAccessToken(payload.sub);
  return { accessToken };
}

export async function logout(userId, refreshToken) {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await query('DELETE FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2', [
      userId,
      tokenHash,
    ]);
  } else {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }
}

export async function getUserById(userId) {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    throw createError(404, 'NOT_FOUND', 'User not found');
  }
  return mapUser(result.rows[0]);
}

export async function updateUser(userId, { displayName, currency }) {
  const fields = [];
  const values = [];
  let i = 1;

  if (displayName !== undefined) {
    fields.push(`display_name = $${i++}`);
    values.push(displayName);
  }
  if (currency !== undefined) {
    fields.push(`currency = $${i++}`);
    values.push(currency);
  }

  if (fields.length === 0) {
    return getUserById(userId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return mapUser(result.rows[0]);
}

export async function deleteUser(userId) {
  await query('DELETE FROM users WHERE id = $1', [userId]);
}
