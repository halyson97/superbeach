import {
  Box,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { MatchCard } from '../components/MatchCard';
import { RankingTable } from '../components/RankingTable';
import { ResultDialog } from '../components/ResultDialog';
import { useChampionshipStore } from '../store/championshipStore';
import { allMatchesFinished } from '../utils/roundRobin';
import type { Match } from '../types';

const GAME_TYPE_LABELS = {
  individual: 'Individual',
  fixed_double: 'Dupla Fixa',
  mix: 'Mix',
} as const;

export function TournamentPage() {
  const navigate = useNavigate();
  const championship = useChampionshipStore((s) => s.championship);
  const startMatch = useChampionshipStore((s) => s.startMatch);
  const submitResult = useChampionshipStore((s) => s.submitResult);
  const finishChampionship = useChampionshipStore((s) => s.finishChampionship);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [confirmFinish, setConfirmFinish] = useState(false);

  useEffect(() => {
    if (!championship) {
      navigate('/');
      return;
    }
    if (championship.status === 'finished') {
      navigate('/final');
    }
  }, [championship, navigate]);

  if (!championship) return null;

  const canFinish = allMatchesFinished(championship.rounds);

  const handleInformResult = (matchId: string) => {
    const match = championship.rounds
      .flatMap((r) => r.matches)
      .find((m) => m.id === matchId);
    if (match) {
      startMatch(matchId);
      setSelectedMatch({ ...match, status: 'in_progress' });
    }
  };

  const handleEditResult = (matchId: string) => {
    const match = championship.rounds
      .flatMap((r) => r.matches)
      .find((m) => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
    }
  };

  const handleSubmitResult = (matchId: string, score1: number, score2: number) => {
    submitResult(matchId, score1, score2);
    setSelectedMatch(null);
  };

  const handleFinish = () => {
    finishChampionship();
    setConfirmFinish(false);
    navigate('/final');
  };

  return (
    <Layout title={championship.name}>
      <Stack spacing={{ xs: 2.5, sm: 3 }}>
        <PageHeader
          title={championship.name}
          subtitle={`${GAME_TYPE_LABELS[championship.gameType]} · ${championship.playerCount} jogadores · ${championship.courtCount} ${championship.courtCount === 1 ? 'quadra' : 'quadras'}`}
          backTo="/"
          backLabel="Início"
        />

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          <Chip label={GAME_TYPE_LABELS[championship.gameType]} size="small" color="primary" variant="outlined" />
          <Chip
            label={
              championship.classificationCriteria === 'wins'
                ? 'Classificação por vitórias'
                : 'Classificação por pontos'
            }
            size="small"
            variant="outlined"
          />
        </Stack>

        <RankingTable
          championship={championship}
          ranking={championship.ranking}
        />

        <Typography variant="h6" sx={{ pt: 0.5 }}>
          Rodadas
        </Typography>

        {championship.rounds.map((round) => (
          <Box key={round.number}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: { xs: '0.95rem', sm: '1rem' },
              }}
            >
              Rodada {round.number}{' '}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                ({round.matches.length}{' '}
                {round.matches.length === 1 ? 'partida' : 'partidas'})
              </Typography>
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {round.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  players={championship.players}
                  onInformResult={handleInformResult}
                  onEditResult={handleEditResult}
                />
              ))}
            </Box>
          </Box>
        ))}

        {canFinish && (
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<EmojiEventsIcon />}
            onClick={() => setConfirmFinish(true)}
            fullWidth
            sx={{ py: 1.5, borderRadius: 3 }}
          >
            Finalizar Campeonato
          </Button>
        )}
      </Stack>

      <ResultDialog
        open={!!selectedMatch}
        match={selectedMatch}
        players={championship.players}
        onClose={() => setSelectedMatch(null)}
        onSubmit={handleSubmitResult}
      />

      <Dialog
        open={confirmFinish}
        onClose={() => setConfirmFinish(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Finalizar campeonato?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Todas as partidas foram concluídas. Deseja encerrar o campeonato e
            ver o resultado final?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
          <Button onClick={() => setConfirmFinish(false)} fullWidth>
            Cancelar
          </Button>
          <Button onClick={handleFinish} variant="contained" color="success" fullWidth>
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
