import {
  Box,
  Chip,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { RankingTable } from '../components/RankingTable';
import { MatchCard } from '../components/MatchCard';
import { getSharedGame } from '../services/gamesApi';
import type { Championship } from '../types';
import { recalculateRanking } from '../utils/ranking';

const GAME_TYPE_LABELS = {
  individual: 'Individual',
  fixed_double: 'Dupla Fixa',
  mix: 'Mix',
} as const;

export function SharePage() {
  const { shareToken } = useParams();
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadGame = useCallback(async () => {
    if (!shareToken) return;
    try {
      const data = await getSharedGame(shareToken);
      const game = {
        ...data.championship,
        ranking: recalculateRanking(data.championship),
      };
      setChampionship(game);
      setOwnerName(data.ownerName);
      setError('');
    } catch {
      setError('Jogo não encontrado ou link inválido.');
      setChampionship(null);
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      void loadGame();
    }, 0);
    const interval = setInterval(() => {
      void loadGame();
    }, 15000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadGame]);

  if (loading) {
    return (
        <Layout title="Acompanhar jogo" maxWidth="lg" showAuth={false}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !championship) {
    return (
      <Layout title="Acompanhar jogo" maxWidth="sm" showAuth={false}>
        <Alert severity="error">{error || 'Jogo não encontrado'}</Alert>
      </Layout>
    );
  }

  const isFinished = championship.status === 'finished';

  return (
    <Layout title={championship.name} maxWidth="lg" showAuth={false}>
      <Stack spacing={{ xs: 2.5, sm: 3 }}>
        <PageHeader
          title={championship.name}
          subtitle={`Acompanhamento ao vivo · Organizado por ${ownerName}`}
        />

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          <Chip
            label={GAME_TYPE_LABELS[championship.gameType]}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={championship.status === 'active' ? 'Em andamento' : 'Finalizado'}
            size="small"
            color={championship.status === 'active' ? 'primary' : 'success'}
            variant="outlined"
          />
          <Chip
            label={`${championship.playerCount} jogadores`}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Stack spacing={1.25}>
          <Typography variant="h6">
            {isFinished ? 'Tabela final' : 'Tabela de classificação'}
          </Typography>
          <RankingTable
            championship={championship}
            ranking={championship.ranking}
            allowCriteriaChange={false}
          />
        </Stack>

        <Typography variant="h6">Rodadas</Typography>

        {championship.rounds.map((round) => (
          <Box key={round.number}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Rodada {round.number}{' '}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                ({round.matches.length}{' '}
                {round.matches.length === 1 ? 'partida' : 'partidas'})
              </Typography>
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {round.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  players={championship.players}
                  onInformResult={() => {}}
                  onEditResult={() => {}}
                  readOnly
                />
              ))}
            </Box>
          </Box>
        ))}

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          Atualização automática a cada 15 segundos
        </Typography>
      </Stack>
    </Layout>
  );
}
