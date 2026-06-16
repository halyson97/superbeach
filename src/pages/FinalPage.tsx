import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { RankingTable } from '../components/RankingTable';
import { useChampionshipStore } from '../store/championshipStore';
import { getRankingEntryName } from '../utils/ranking';
import { BRAND } from '../constants/brand';

const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const PODIUM_LABELS = ['1º Lugar', '2º Lugar', '3º Lugar'];
const PODIUM_HEIGHTS = { xs: 'auto', sm: [140, 120, 100] };

export function FinalPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const current = useChampionshipStore((s) => s.championship);
  const getChampionshipById = useChampionshipStore((s) => s.getChampionshipById);
  const hasActiveGame = current?.status === 'active';

  const championship = id ? getChampionshipById(id) : current;
  const isHistoryView = !!id;

  useEffect(() => {
    if (!championship) {
      navigate('/');
      return;
    }
    if (championship.status !== 'finished') {
      navigate('/torneio');
    }
  }, [championship, navigate]);

  if (!championship || championship.status !== 'finished') return null;

  const ranking = championship.ranking;
  const champion = ranking[0];
  const podium = ranking.slice(0, 3);
  const matchHistoryPath = isHistoryView
    ? `/ranking/${championship.id}/partidas`
    : '/partidas';

  return (
    <Layout title={isHistoryView ? 'Ranking' : 'Resultado Final'} maxWidth="md">
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <PageHeader
          title={isHistoryView ? championship.name : 'Jogo Finalizado!'}
          subtitle={isHistoryView ? 'Ranking final do jogo' : championship.name}
          backTo="/"
          backLabel="Início"
        />

        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 2, sm: 3 },
            px: 2,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha('#0891B2', 0.12)} 0%, ${alpha('#F97316', 0.08)} 100%)`,
            border: '1px solid',
            borderColor: alpha('#0891B2', 0.15),
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'warning.main', mb: 1 }} />
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
            Campeão {BRAND.name}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              mt: 0.5,
              background: 'linear-gradient(135deg, #0891B2 0%, #F97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {getRankingEntryName(championship, champion)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {championship.classificationCriteria === 'points'
              ? `${champion.points} pontos`
              : `${champion.wins} vitórias`}
            {' · '}
            Saldo {champion.balance}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
            alignItems: { sm: 'flex-end' },
          }}
        >
          {[1, 0, 2].map((podiumIndex) => {
            const entry = podium[podiumIndex];
            if (!entry) return null;
            const heights = PODIUM_HEIGHTS.sm as number[];
            return (
              <Card
                key={entry.playerId}
                sx={{
                  order: { xs: podiumIndex, sm: podiumIndex === 0 ? 2 : podiumIndex === 1 ? 1 : 3 },
                  borderTop: `4px solid ${PODIUM_COLORS[podiumIndex]}`,
                  textAlign: 'center',
                  minHeight: { sm: heights[podiumIndex] },
                  display: 'flex',
                  alignItems: 'center',
                  ...(podiumIndex === 0 && {
                    transform: { sm: 'translateY(-8px)' },
                    boxShadow: `0 12px 32px ${alpha('#FFD700', 0.2)}`,
                  }),
                }}
              >
                <CardContent sx={{ width: '100%', py: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {PODIUM_LABELS[podiumIndex]}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.15rem' },
                      wordBreak: 'break-word',
                    }}
                  >
                    {getRankingEntryName(championship, entry)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {championship.classificationCriteria === 'points'
                      ? `${entry.points} pts`
                      : `${entry.wins} vitórias`}
                    {' · '}
                    Saldo {entry.balance}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HistoryIcon />}
              onClick={() => navigate(matchHistoryPath)}
            >
              Ver histórico de partidas
            </Button>
          </Box>

          <RankingTable
            championship={championship}
            ranking={ranking}
            highlightTop={3}
            allowCriteriaChange={false}
          />
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            fullWidth
          >
            Voltar ao Início
          </Button>
          {!hasActiveGame && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/novo')}
              fullWidth
            >
              Novo Jogo
            </Button>
          )}
        </Stack>
      </Stack>
    </Layout>
  );
}
