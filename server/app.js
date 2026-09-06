// /server/app.js
// Express application configuration for Cognivault backend

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/healthRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import userDataRoutes from './routes/userDataRoutes.js';
import { config } from './config/secrets.js';

const app = express();

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS.'));
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: config.maxPayloadSize }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Local development requests are still subject to auth and payload
    // validation, but should not be blocked by a shared browser IP bucket.
    skip: (req) =>
      config.nodeEnv !== 'production' &&
      ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip),
    message: { error: 'Too many requests. Please try again shortly.' },
  }),
);

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api', userDataRoutes);

app.use('/api', (_req, res) => {
  // Keep API misses as JSON while allowing the development Vite middleware
  // to handle every non-API request as part of the React SPA.
  res.status(404).json({ error: 'Route not found.' });
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled API error:', error?.message || error);
  const status = error?.statusCode || 500;
  return res.status(status).json({
    error: status === 500 ? 'An unexpected server error occurred.' : error.message,
  });
});

export default app;
