import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import type { AuthRequest } from '../types/auth.js';

const router = Router();

function createToken(userId: string) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '30d' });
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      throw new AppError('Nome, email e senha são obrigatórios', 400);
    }

    if (password.length < 6) {
      throw new AppError('A senha deve ter pelo menos 6 caracteres', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new AppError('Email já cadastrado', 409);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
    });

    const token = createToken(user._id.toString());
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      throw new AppError('Email e senha são obrigatórios', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    const token = createToken(user._id.toString());
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  }),
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await User.findById(req.userId).select('name email');
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({ id: user._id, name: user.name, email: user.email });
  }),
);

export default router;
