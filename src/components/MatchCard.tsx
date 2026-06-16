import {
  Chip,
  Paper,
  Stack,
  Typography,
  Button,
  Box,
  alpha,
} from '@mui/material';
import type { Match, MatchCategory, Player } from '../types';
import { formatSideNames } from '../utils/ranking';

const STATUS_LABELS: Record<
  Match['status'],
  { label: string; color: 'default' | 'warning' | 'success' }
> = {
  not_started: { label: 'Não iniciada', color: 'default' },
  in_progress: { label: 'Em andamento', color: 'warning' },
  finished: { label: 'Finalizada', color: 'success' },
};

const CATEGORY_LABELS: Record<MatchCategory, { label: string; color: string }> = {
  men: { label: 'Masculino', color: '#3B82F6' },
  women: { label: 'Feminino', color: '#EC4899' },
  mixed: { label: 'Misto', color: '#8B5CF6' },
};

interface MatchCardProps {
  match: Match;
  players: Player[];
  onInformResult: (matchId: string) => void;
  onEditResult: (matchId: string) => void;
}

export function MatchCard({
  match,
  players,
  onInformResult,
  onEditResult,
}: MatchCardProps) {
  const statusInfo = STATUS_LABELS[match.status];
  const side1 = formatSideNames(match.side1Ids, players);
  const side2 = formatSideNames(match.side2Ids, players);
  const categoryInfo = match.category ? CATEGORY_LABELS[match.category] : null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(8, 145, 178, 0.12)',
        },
        ...(match.status === 'finished' && {
          borderColor: alpha('#10B981', 0.3),
          bgcolor: alpha('#10B981', 0.03),
        }),
      }}
    >
      <Stack spacing={1.5} sx={{ flex: 1 }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              label={`Quadra ${match.court}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            {categoryInfo && (
              <Chip
                label={categoryInfo.label}
                size="small"
                sx={{
                  borderColor: categoryInfo.color,
                  color: categoryInfo.color,
                  fontWeight: 600,
                }}
                variant="outlined"
              />
            )}
          </Stack>
          <Chip label={statusInfo.label} size="small" color={statusInfo.color} />
        </Stack>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' }, wordBreak: 'break-word' }}
          >
            {side1}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', my: 0.5, fontWeight: 600 }}
          >
            VS
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' }, wordBreak: 'break-word' }}
          >
            {side2}
          </Typography>
        </Box>

        {match.status === 'finished' &&
          match.score1 !== undefined &&
          match.score2 !== undefined && (
            <Box
              sx={{
                textAlign: 'center',
                py: 1,
                px: 2,
                borderRadius: 2,
                bgcolor: alpha('#0891B2', 0.08),
              }}
            >
              <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
                {match.score1} × {match.score2}
              </Typography>
            </Box>
          )}

        {match.status === 'finished' ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => onEditResult(match.id)}
            fullWidth
          >
            Editar Resultado
          </Button>
        ) : (
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
