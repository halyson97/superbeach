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
import { BRAND } from '../constants/brand';

const GAME_TYPE_LABELS = {
  individual: 'Individual',
  fixed_double: 'Dupla Fixa',
  mix: 'Mix',
} as const;

export function HomePage() {
  const navigate = useNavigate();
  const championship = useChampionshipStore((s) => s.championship);
  const deleteChampionship = useChampionshipStore((s) => s.deleteChampionship);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasActiveChampionship =
    championship && championship.status === 'active';

  const handleDelete = () => {
    deleteChampionship();
    setConfirmDelete(false);
  };

  const handleContinue = () => {
    if (championship?.status === 'finished') {
      navigate('/final');
    } else {
      navigate('/torneio');
    }
  };

  const progress = championship
    ? (getFinishedMatches(championship.rounds) /
        Math.max(getTotalMatches(championship.rounds), 1)) *
      100
    : 0;

  return (
    <Layout maxWidth="sm">
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Box
          sx={{
            textAlign: 'center',
            pt: { xs: 1, sm: 2 },
            pb: { xs: 0, sm: 1 },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Logo size="lg" />
          </Box>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 320, mx: 'auto', lineHeight: 1.6 }}
          >
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
          disabled={!!hasActiveChampionship}
          fullWidth
          sx={{
            py: 1.75,
            fontSize: '1.05rem',
            borderRadius: 3,
          }}
        >
          Novo Jogo
        </Button>

        {hasActiveChampionship && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Finalize ou exclua o jogo atual para iniciar um novo.
          </Typography>
        )}

        {championship && (
          <Card>
            <CardContent sx={{ pb: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
                  Jogo Atual
                </Typography>
                <Chip
                  label={championship.status === 'active' ? 'Em andamento' : 'Finalizado'}
                  size="small"
                  color={championship.status === 'active' ? 'primary' : 'success'}
                  variant="outlined"
                />
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {championship.name}
              </Typography>

              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                <Chip
                  label={GAME_TYPE_LABELS[championship.gameType]}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${championship.playerCount} jogadores`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${championship.courtCount} ${championship.courtCount === 1 ? 'quadra' : 'quadras'}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Box sx={{ mb: 1 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Progresso
                  </Typography>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                    {getFinishedMatches(championship.rounds)} /{' '}
                    {getTotalMatches(championship.rounds)} partidas
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'action.hover',
                  }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Criado em {new Date(championship.createdAt).toLocaleString('pt-BR')}
              </Typography>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, pt: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleContinue}
                fullWidth
                sx={{ flex: { sm: 1 } }}
              >
                Continuar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDelete(true)}
                fullWidth
                sx={{ flex: { sm: 1 } }}
              >
                Excluir
              </Button>
            </CardActions>
          </Card>
        )}
      </Stack>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir jogo?"
        description="Esta ação não pode ser desfeita. Todos os dados do jogo serão removidos."
        confirmLabel="Excluir"
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Layout>
  );
}
