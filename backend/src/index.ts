import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDB } from './db/connect.js';
import authRoutes from './routes/auth.js';
import gamesRoutes from './routes/games.js';
import shareRoutes from './routes/share.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'superbeach-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/share', shareRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', error);
  process.exit(1);
});

async function start() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`API rodando em http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  const message =
    error instanceof AppError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Falha ao iniciar servidor';

  console.error('Falha ao iniciar servidor:', message);
  process.exit(1);
});
