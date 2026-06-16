import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

function isJsonSyntaxError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: number }).status === 400 &&
    'body' in error
  );
}

function getMongooseErrorMessage(error: mongoose.Error.ValidationError | mongoose.Error.CastError): string {
  if (error instanceof mongoose.Error.ValidationError) {
    const first = Object.values(error.errors)[0];
    return first?.message ?? 'Dados inválidos';
  }

  if (error instanceof mongoose.Error.CastError) {
    return `Valor inválido para o campo "${error.path}"`;
  }

  return 'Erro de validação';
}

function getDuplicateKeyMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'keyPattern' in error) {
    const keys = Object.keys((error as { keyPattern: Record<string, unknown> }).keyPattern);
    if (keys[0] === 'email') return 'Email já cadastrado';
    if (keys.length > 0) return `${keys[0]} já cadastrado`;
  }
  return 'Registro já existe';
}

function getModuleNotFoundMessage(error: Error): string | null {
  if (!('code' in error) || (error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') {
    return null;
  }

  if (error.message.includes('encodings')) {
    return 'Dependência iconv-lite incompleta. Reinstale as dependências do backend.';
  }

  return `Módulo não encontrado: ${error.message}`;
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(env.nodeEnv === 'development' && { stack: error.stack }),
    });
    return;
  }

  if (isJsonSyntaxError(error)) {
    res.status(400).json({ message: 'JSON inválido no corpo da requisição' });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: getMongooseErrorMessage(error) });
    return;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  ) {
    res.status(409).json({ message: getDuplicateKeyMessage(error) });
    return;
  }

  if (error instanceof Error) {
    const moduleMessage = getModuleNotFoundMessage(error);
    if (moduleMessage) {
      console.error('[API Error]', error);
      res.status(500).json({
        message: env.nodeEnv === 'development' ? moduleMessage : 'Erro interno do servidor',
        ...(env.nodeEnv === 'development' && { stack: error.stack }),
      });
      return;
    }
  }

  if (error instanceof Error && error.name === 'JsonWebTokenError') {
    res.status(401).json({ message: 'Token inválido' });
    return;
  }

  if (error instanceof Error && error.name === 'TokenExpiredError') {
    res.status(401).json({ message: 'Token expirado' });
    return;
  }

  console.error('[API Error]', error);

  const message =
    env.nodeEnv === 'development' && error instanceof Error
      ? error.message
      : 'Erro interno do servidor';

  res.status(500).json({
    message,
    ...(env.nodeEnv === 'development' && error instanceof Error && { stack: error.stack }),
  });
}
