import {
  Chip,
  Paper,
  Stack,
  Typography,
  Button,
  Box,
} from '@mui/material';
import type { Match, Player } from '../types';
import { formatSideNames } from '../utils/ranking';

const STATUS_LABELS: Record<Match['status'], { label: string; color: 'default' | 'warning' | 'success' }> = {
  not_started: { label: 'Não iniciada', color: 'default' },
  in_progress: { label: 'Em andamento', color: 'warning' },
  finished: { label: 'Finalizada', color: 'success' },
};

interface MatchCardProps {
  match: Match;
  players: Player[];
  onInformResult: (matchId: string) => void;
  onEditResult: (matchId: string) => void;
}

export function MatchCard({ match, players, onInformResult, onEditResult }: MatchCardProps) {
  const statusInfo = STATUS_LABELS[match.status];
  const side1 = formatSideNames(match.side1Ids, players);
  const side2 = formatSideNames(match.side2Ids, players);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
        >
          <Chip label={`Quadra ${match.court}`} size="small" color="primary" variant="outlined" />
          <Chip label={statusInfo.label} size="small" color={statusInfo.color} />
        </Stack>

        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {side1}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ my: 0.5 }}>
            vs
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {side2}
          </Typography>
        </Box>

        {match.status === 'finished' && match.score1 !== undefined && match.score2 !== undefined && (
          <>
            <Typography variant="h6" color="primary">
              {match.score1} x {match.score2}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onEditResult(match.id)}
              fullWidth
            >
              Editar Resultado
            </Button>
          </>
        )}

        {match.status !== 'finished' && (
          <Button
            variant="contained"
            size="small"
            onClick={() => onInformResult(match.id)}
            fullWidth
          >
            Informar Resultado
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
