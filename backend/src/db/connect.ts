import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export async function connectDB() {
  if (!env.mongoUri) {
    throw new AppError('MONGO_URI não configurada no arquivo .env', 500, false);
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB conectado');
  } catch (error) {
    const message =
      error instanceof Error
        ? `Falha ao conectar no MongoDB: ${error.message}`
        : 'Falha ao conectar no MongoDB';
    throw new AppError(message, 500, false);
  }
}
