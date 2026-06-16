import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { RankingTable } from '../components/RankingTable';
import { useChampionshipStore } from '../store/championshipStore';
import { getPlayerName } from '../utils/ranking';

const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const PODIUM_LABELS = ['1º Lugar', '2º Lugar', '3º Lugar'];

export function FinalPage() {
  const navigate = useNavigate();
  const championship = useChampionshipStore((s) => s.championship);
  const deleteChampionship = useChampionshipStore((s) => s.deleteChampionship);

  useEffect(() => {
    if (!championship) {
      navigate('/');
    }
  }, [championship, navigate]);

  if (!championship) return null;

  const ranking = championship.ranking;
  const champion = ranking[0];
  const podium = ranking.slice(0, 3);

  const handleNewChampionship = () => {
    deleteChampionship();
    navigate('/novo');
  };

  return (
    <Layout title="Resultado Final">
      <Stack spacing={4}>
        <Box sx={{ textAlign: 'center' }}>
          <EmojiEventsIcon sx={{ fontSize: 64, color: 'warning.main', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
            Campeonato Finalizado!
          </Typography>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
            Campeão: {getPlayerName(championship.players, champion.playerId)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {podium.map((entry, index) => (
            <Card
              key={entry.playerId}
              sx={{
                borderTop: `4px solid ${PODIUM_COLORS[index]}`,
                textAlign: 'center',
              }}
            >
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  {PODIUM_LABELS[index]}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {getPlayerName(championship.players, entry.playerId)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {championship.classificationCriteria === 'points'
                    ? `${entry.points} pontos`
                    : `${entry.wins} vitórias`}
                  {' · '}
                  Saldo: {entry.balance}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <RankingTable
          championship={championship}
          ranking={ranking}
          highlightTop={3}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            fullWidth
          >
            Voltar ao Início
          </Button>
          <Button
            variant="contained"
            onClick={handleNewChampionship}
            fullWidth
          >
            Novo Campeonato
          </Button>
        </Stack>
      </Stack>
    </Layout>
  );
}
