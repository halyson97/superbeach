import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  mongoUri: process.env.MONGO_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  port: Number(process.env.PORT ?? 8000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  keepAliveUrl: process.env.KEEP_ALIVE_URL ?? 'https://superbeach.onrender.com/',
  keepAliveIntervalMs: Number(process.env.KEEP_ALIVE_INTERVAL_MS ?? 30_000),
  keepAliveEnabled:
    process.env.KEEP_ALIVE_ENABLED === 'true' ||
    (process.env.KEEP_ALIVE_ENABLED !== 'false' && process.env.NODE_ENV === 'production'),
};

if (!env.mongoUri) {
  console.warn('MONGO_URI não definida no .env');
}
