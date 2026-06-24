import { verifyAccessToken } from '../utils/jwt.js';
import { createError } from './errorHandler.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(createError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header'));
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    next(createError(401, 'UNAUTHORIZED', 'Invalid or expired access token'));
  }
}
