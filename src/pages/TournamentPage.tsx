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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { MatchCard } from '../components/MatchCard';
import { RankingTable } from '../components/RankingTable';
import { ResultDialog } from '../components/ResultDialog';
import { useChampionshipStore } from '../store/championshipStore';
import { allMatchesFinished } from '../utils/roundRobin';
import type { Match } from '../types';

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
      <Stack spacing={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Início
        </Button>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {championship.name}
          </Typography>
          <Typography color="text.secondary">
            {championship.gameType === 'individual' ? 'Individual' : 'Dupla Fixa'}{' '}
            · {championship.playerCount} jogadores · {championship.courtCount}{' '}
            {championship.courtCount === 1 ? 'quadra' : 'quadras'}
          </Typography>
        </Box>

        <RankingTable
          championship={championship}
          ranking={championship.ranking}
        />

        <Typography variant="h6">Rodadas</Typography>

        {championship.rounds.map((round) => (
          <Box key={round.number}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              Rodada {round.number} ({round.matches.length}{' '}
              {round.matches.length === 1 ? 'partida' : 'partidas'})
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
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

      <Dialog open={confirmFinish} onClose={() => setConfirmFinish(false)}>
        <DialogTitle>Finalizar campeonato?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Todas as partidas foram concluídas. Deseja encerrar o campeonato e
            ver o resultado final?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmFinish(false)}>Cancelar</Button>
          <Button onClick={handleFinish} variant="contained" color="success">
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
