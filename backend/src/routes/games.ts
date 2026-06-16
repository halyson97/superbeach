import { Router } from 'express';
import crypto from 'crypto';
import { Game } from '../models/Game.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import type { AuthRequest } from '../types/auth.js';

const router = Router();

router.use(authMiddleware);

function mapGame(game: InstanceType<typeof Game>) {
  const championship = game.championship as Record<string, unknown>;
  return {
    ...championship,
    shareToken: game.shareToken,
  } as Record<string, unknown> & {
    status: string;
    finishedAt?: string;
    createdAt: string;
    shareToken: string;
  };
}

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const games = await Game.find({ userId: req.userId }).sort({ updatedAt: -1 });
    const mapped = games.map(mapGame);

    const current = mapped.find((g) => g.status === 'active') ?? null;
    const history = mapped
      .filter((g) => g.status === 'finished')
      .sort((a, b) => {
        const dateA = String(a.finishedAt ?? a.createdAt);
        const dateB = String(b.finishedAt ?? b.createdAt);
        return dateB.localeCompare(dateA);
      });

    res.json({ current, history });
  }),
);

router.get(
  '/:championshipId',
  asyncHandler(async (req: AuthRequest, res) => {
    const game = await Game.findOne({
      userId: req.userId,
      championshipId: req.params.championshipId,
    });

    if (!game) {
      throw new AppError('Jogo não encontrado', 404);
    }

    res.json(mapGame(game));
  }),
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const championship = req.body.championship as Record<string, unknown> | undefined;

    if (!championship?.id || typeof championship.id !== 'string') {
      throw new AppError('Dados do jogo inválidos: id ausente', 400);
    }

    const active = await Game.findOne({ userId: req.userId, status: 'active' });
    if (active) {
      throw new AppError(
        'Já existe um jogo em andamento. Finalize ou exclua antes de criar outro.',
        400,
      );
    }

    const shareToken = crypto.randomUUID();
    const game = await Game.create({
      userId: req.userId,
      shareToken,
      championshipId: championship.id,
      championship,
      status: (championship.status as string) ?? 'active',
    });

    res.status(201).json(mapGame(game));
  }),
);

router.put(
  '/:championshipId',
  asyncHandler(async (req: AuthRequest, res) => {
    const championship = req.body.championship as Record<string, unknown> | undefined;

    if (!championship) {
      throw new AppError('Dados do jogo inválidos', 400);
    }

    const game = await Game.findOne({
      userId: req.userId,
      championshipId: req.params.championshipId,
    });

    if (!game) {
      throw new AppError('Jogo não encontrado', 404);
    }

    game.championship = championship;
    game.status = (championship.status as 'active' | 'finished') ?? game.status;
    await game.save();

    res.json(mapGame(game));
  }),
);

router.delete(
  '/:championshipId',
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await Game.deleteOne({
      userId: req.userId,
      championshipId: req.params.championshipId,
    });

    if (result.deletedCount === 0) {
      throw new AppError('Jogo não encontrado', 404);
    }

    res.status(204).send();
  }),
);

export default router;
