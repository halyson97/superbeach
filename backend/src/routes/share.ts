import { Router } from 'express';
import { Game } from '../models/Game.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

router.get(
  '/:shareToken',
  asyncHandler(async (req, res) => {
    const { shareToken } = req.params;

    if (!shareToken?.trim()) {
      throw new AppError('Link de compartilhamento inválido', 400);
    }

    const game = await Game.findOne({ shareToken });
    if (!game) {
      throw new AppError('Jogo não encontrado ou link expirado', 404);
    }

    const owner = await User.findById(game.userId).select('name');
    const championship = game.championship as Record<string, unknown>;

    res.json({
      championship: {
        ...championship,
        shareToken: game.shareToken,
      },
      ownerName: owner?.name ?? 'Organizador',
    });
  }),
);

export default router;
