import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import type { Championship, ClassificationCriteria, RankingEntry } from '../types';
import { getRankingEntryName } from '../utils/ranking';
import { useChampionshipStore } from '../store/championshipStore';

const CRITERIA_LABELS: Record<ClassificationCriteria, string> = {
  wins: 'Vitórias',
  points: 'Pontos',
};

interface RankingTableProps {
  championship: Championship;
  ranking: RankingEntry[];
  highlightTop?: number;
  allowCriteriaChange?: boolean;
}

export function RankingTable({
  championship,
  ranking,
  highlightTop = 0,
  allowCriteriaChange = true,
}: RankingTableProps) {
  const updateClassificationCriteria = useChampionshipStore(
    (s) => s.updateClassificationCriteria,
  );

  const criteria = championship.classificationCriteria;
  const isTeamRanking = championship.gameType === 'fixed_double';

  const handleCriteriaChange = (
    _: React.MouseEvent<HTMLElement>,
    value: ClassificationCriteria | null,
  ) => {
    if (value && value !== criteria) {
      updateClassificationCriteria(value);
    }
  };

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: { xs: 1.5, sm: 2 }, pb: 0 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Classificação
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Critério: <strong>{CRITERIA_LABELS[criteria]}</strong>
          </Typography>

          {allowCriteriaChange && (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={criteria}
              onChange={handleCriteriaChange}
              fullWidth
              sx={{ maxWidth: { sm: 280 } }}
            >
              <ToggleButton value="wins" sx={{ flex: 1 }}>
                Vitórias
              </ToggleButton>
              <ToggleButton value="points" sx={{ flex: 1 }}>
                Pontos
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      </Box>

      <TableContainer className="table-scroll" sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 520 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  minWidth: 36,
                }}
              >
                #
              </TableCell>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 36,
                  zIndex: 2,
                  minWidth: { xs: 100, sm: 140 },
                  boxShadow: '4px 0 8px -4px rgba(0,0,0,0.08)',
                }}
              >
                {isTeamRanking ? 'Dupla' : 'Jogador'}
              </TableCell>
              <TableCell align="center">J</TableCell>
              <TableCell
                align="center"
                sx={criteria === 'wins' ? { fontWeight: 700, color: 'primary.main' } : undefined}
              >
                V
              </TableCell>
              <TableCell align="center">D</TableCell>
              <TableCell align="center">GP</TableCell>
              <TableCell align="center">GC</TableCell>
              <TableCell align="center">S</TableCell>
              <TableCell
                align="center"
                sx={criteria === 'points' ? { fontWeight: 700, color: 'primary.main' } : undefined}
              >
                Pts
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ranking.map((entry, index) => (
              <TableRow
                key={entry.playerId}
                sx={{
                  bgcolor:
                    index < highlightTop ? 'action.hover' : 'background.paper',
                  ...(index === 0 && highlightTop > 0 && {
                    bgcolor: 'rgba(251, 191, 36, 0.12)',
                  }),
                }}
              >
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    bgcolor: 'inherit',
                    fontWeight: 700,
                    zIndex: 1,
                  }}
                >
                  {index + 1}
                </TableCell>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 36,
                    bgcolor: 'inherit',
                    fontWeight: 600,
                    zIndex: 1,
                    maxWidth: { xs: 120, sm: 180 },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    boxShadow: '4px 0 8px -4px rgba(0,0,0,0.06)',
                  }}
                >
                  {getRankingEntryName(championship, entry)}
                </TableCell>
                <TableCell align="center">{entry.gamesPlayed}</TableCell>
                <TableCell
                  align="center"
                  sx={criteria === 'wins' ? { fontWeight: 700 } : undefined}
                >
                  {entry.wins}
                </TableCell>
                <TableCell align="center">{entry.losses}</TableCell>
                <TableCell align="center">{entry.gamesFor}</TableCell>
                <TableCell align="center">{entry.gamesAgainst}</TableCell>
                <TableCell align="center">{entry.balance}</TableCell>
                <TableCell
                  align="center"
                  sx={criteria === 'points' ? { fontWeight: 700 } : undefined}
                >
                  {entry.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
