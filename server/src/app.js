import express from 'express';
import helmet from 'helmet';
import { env, getClientOrigins } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    const allowed = getClientOrigins();
    let isAllowed = allowed.includes(origin);

    if (!isAllowed) {
      try {
        isAllowed = new URL(origin).host === req.headers.host;
      } catch {
        isAllowed = false;
      }
    }

    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Vary', 'Origin');
    } else if (req.method === 'OPTIONS') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not allowed by CORS' } });
    }
  }

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json());

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
