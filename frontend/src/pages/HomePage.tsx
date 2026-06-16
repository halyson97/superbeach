import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import GridViewIcon from '@mui/icons-material/GridView';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Logo } from '../components/Logo';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useChampionshipStore } from '../store/championshipStore';
import { getFinishedMatches, getTotalMatches } from '../utils/roundRobin';
import { getRankingEntryName } from '../utils/ranking';
import { BRAND } from '../constants/brand';
import type { Championship } from '../types';

const GAME_TYPE_LABELS = {
  individual: 'Individual',
  fixed_double: 'Dupla Fixa',
  mix: 'Mix',
} as const;

interface GameCardProps {
  game: Championship;
  label: string;
  showProgress?: boolean;
  onContinue?: () => void;
  onViewRanking: () => void;
  onDelete: () => void;
}

function GameCard({
  game,
  label,
  showProgress = false,
  onContinue,
  onViewRanking,
  onDelete,
}: GameCardProps) {
  const isActive = game.status === 'active';
  const progress = showProgress
    ? (getFinishedMatches(game.rounds) /
        Math.max(getTotalMatches(game.rounds), 1)) *
      100
    : 100;

  const champion = game.ranking[0];

  return (
    <Card>
      <CardContent sx={{ pb: 1 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <Chip
            label={isActive ? 'Em andamento' : 'Finalizado'}
            size="small"
            color={isActive ? 'primary' : 'success'}
            variant="outlined"
          />
        </Stack>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {game.name}
        </Typography>

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          <Chip label={GAME_TYPE_LABELS[game.gameType]} size="small" variant="outlined" />
          <Chip label={`${game.playerCount} jogadores`} size="small" variant="outlined" />
          <Chip
            label={`${game.courtCount} ${game.courtCount === 1 ? 'quadra' : 'quadras'}`}
            size="small"
            variant="outlined"
          />
        </Stack>

        {showProgress && isActive && (
          <Box sx={{ mb: 1 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progresso
              </Typography>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                {getFinishedMatches(game.rounds)} / {getTotalMatches(game.rounds)} partidas
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover' }}
            />
          </Box>
        )}

        {!isActive && champion && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Campeão:{' '}
            <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {getRankingEntryName(game, champion)}
            </Typography>
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          {isActive
            ? `Criado em ${new Date(game.createdAt).toLocaleString('pt-BR')}`
            : `Finalizado em ${new Date(game.finishedAt ?? game.createdAt).toLocaleString('pt-BR')}`}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        {isActive && onContinue ? (
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={onContinue}
            fullWidth
            sx={{ flex: { sm: 1 } }}
          >
            Continuar
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<LeaderboardIcon />}
            onClick={onViewRanking}
            fullWidth
            sx={{ flex: { sm: 1 } }}
          >
            Ver Ranking
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          fullWidth
          sx={{ flex: { sm: 1 } }}
        >
          Excluir
        </Button>
      </CardActions>
    </Card>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const championship = useChampionshipStore((s) => s.championship);
  const history = useChampionshipStore((s) => s.history);
  const deleteChampionship = useChampionshipStore((s) => s.deleteChampionship);
  const deleteFromHistory = useChampionshipStore((s) => s.deleteFromHistory);

  const [confirmDeleteCurrent, setConfirmDeleteCurrent] = useState(false);
  const [historyDeleteId, setHistoryDeleteId] = useState<string | null>(null);

  const hasActiveGame = championship?.status === 'active';

  const handleDeleteCurrent = async () => {
    await deleteChampionship();
    setConfirmDeleteCurrent(false);
  };

  const handleDeleteHistory = async () => {
    if (historyDeleteId) {
      await deleteFromHistory(historyDeleteId);
      setHistoryDeleteId(null);
    }
  };

  return (
    <Layout maxWidth="sm">
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Box sx={{ textAlign: 'center', pt: { xs: 1, sm: 2 }, pb: { xs: 0, sm: 1 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Logo size="lg" />
          </Box>
          <Typography color="text.secondary" sx={{ maxWidth: 320, mx: 'auto', lineHeight: 1.6 }}>
            {BRAND.tagline}
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          {[
            { icon: GridViewIcon, label: 'Sorteio automático' },
            { icon: GroupsIcon, label: 'Individual, dupla e mix' },
            { icon: EmojiEventsIcon, label: 'Ranking ao vivo' },
          ].map(({ icon: Icon, label }) => (
            <Box
              key={label}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Icon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/novo')}
          disabled={!!hasActiveGame}
          fullWidth
          sx={{ py: 1.75, fontSize: '1.05rem', borderRadius: 3 }}
        >
          Novo Jogo
        </Button>

        {hasActiveGame && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Finalize o jogo em andamento para iniciar um novo.
          </Typography>
        )}

        {championship && (
          <GameCard
            game={championship}
            label="Jogo Atual"
            showProgress
            onContinue={
              championship.status === 'active'
                ? () => navigate('/torneio')
                : undefined
            }
            onViewRanking={() => navigate('/final')}
            onDelete={() => setConfirmDeleteCurrent(true)}
          />
        )}

        {history.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Histórico
            </Typography>
            <Stack spacing={2}>
              {history.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  label="Jogo Anterior"
                  onViewRanking={() => navigate(`/ranking/${game.id}`)}
                  onDelete={() => setHistoryDeleteId(game.id)}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>

      <ConfirmDialog
        open={confirmDeleteCurrent}
        title="Excluir jogo?"
        description="Esta ação não pode ser desfeita. Todos os dados do jogo serão removidos."
        confirmLabel="Excluir"
        confirmColor="error"
        onConfirm={handleDeleteCurrent}
        onCancel={() => setConfirmDeleteCurrent(false)}
      />

      <ConfirmDialog
        open={!!historyDeleteId}
        title="Excluir do histórico?"
        description="Este jogo será removido permanentemente do histórico."
        confirmLabel="Excluir"
        confirmColor="error"
        onConfirm={handleDeleteHistory}
        onCancel={() => setHistoryDeleteId(null)}
      />
    </Layout>
  );
}
