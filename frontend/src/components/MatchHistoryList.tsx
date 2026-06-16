import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import type { Championship, Match, MatchCategory } from '../types';
import { formatSideNames } from '../utils/ranking';

const CATEGORY_LABELS: Record<MatchCategory, { label: string; color: string }> = {
  men: { label: 'Masculino', color: '#3B82F6' },
  women: { label: 'Feminino', color: '#EC4899' },
  mixed: { label: 'Misto', color: '#8B5CF6' },
};

interface MatchHistoryItemProps {
  match: Match;
  players: Championship['players'];
}

function MatchHistoryItem({ match, players }: MatchHistoryItemProps) {
  const side1 = formatSideNames(match.side1Ids, players);
  const side2 = formatSideNames(match.side2Ids, players);
  const categoryInfo = match.category ? CATEGORY_LABELS[match.category] : null;
  const isFinished = match.status === 'finished';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        bgcolor: isFinished ? alpha('#10B981', 0.03) : 'background.paper',
        borderColor: isFinished ? alpha('#10B981', 0.2) : 'divider',
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          <Chip label={`Quadra ${match.court}`} size="small" color="primary" variant="outlined" />
          {categoryInfo && (
            <Chip
              label={categoryInfo.label}
              size="small"
              variant="outlined"
              sx={{ borderColor: categoryInfo.color, color: categoryInfo.color, fontWeight: 600 }}
            />
          )}
          {!isFinished && (
            <Chip label="Sem resultado" size="small" variant="outlined" />
          )}
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
            gap: { xs: 0.5, sm: 2 },
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 700, wordBreak: 'break-word', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            {side1}
          </Typography>

          {isFinished && match.score1 !== undefined && match.score2 !== undefined ? (
            <Typography
              variant="h6"
              color="primary"
              sx={{
                fontWeight: 800,
                textAlign: 'center',
                minWidth: 72,
              }}
            >
              {match.score1} × {match.score2}
            </Typography>
          ) : (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: 'center', fontWeight: 700 }}
            >
              VS
            </Typography>
          )}

          <Typography
            sx={{
              fontWeight: 700,
              wordBreak: 'break-word',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              textAlign: { sm: 'right' },
            }}
          >
            {side2}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

interface MatchHistoryListProps {
  championship: Championship;
  onlyFinished?: boolean;
}

export function MatchHistoryList({
  championship,
  onlyFinished = false,
}: MatchHistoryListProps) {
  const rounds = championship.rounds.map((round) => ({
    ...round,
    matches: onlyFinished
      ? round.matches.filter((m) => m.status === 'finished')
      : round.matches,
  })).filter((round) => round.matches.length > 0);

  if (rounds.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
        Nenhuma partida finalizada ainda.
      </Typography>
    );
  }

  return (
    <Stack spacing={2.5}>
      {rounds.map((round) => (
        <Box key={round.number}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            Rodada {round.number}{' '}
            <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              ({round.matches.length}{' '}
              {round.matches.length === 1 ? 'partida' : 'partidas'})
            </Typography>
          </Typography>
          <Stack spacing={1.5}>
            {round.matches.map((match) => (
              <MatchHistoryItem
                key={match.id}
                match={match}
                players={championship.players}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
