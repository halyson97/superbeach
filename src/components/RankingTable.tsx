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
    <TableContainer component={Paper} variant="outlined">
      <Box
        sx={{
          p: 2,
          pb: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Typography variant="h6">Classificação</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Critério: <strong>{CRITERIA_LABELS[criteria]}</strong>
          </Typography>

          {allowCriteriaChange && (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={criteria}
              onChange={handleCriteriaChange}
            >
              <ToggleButton value="wins">Vitórias</ToggleButton>
              <ToggleButton value="points">Pontos</ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      </Box>

      <Table size="small" sx={{ mt: 1 }}>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>{isTeamRanking ? 'Dupla' : 'Jogador'}</TableCell>
            <TableCell align="center">Jogos</TableCell>
            <TableCell
              align="center"
              sx={criteria === 'wins' ? { fontWeight: 700 } : undefined}
            >
              Vitórias
            </TableCell>
            <TableCell align="center">Derrotas</TableCell>
            <TableCell align="center">Games Pró</TableCell>
            <TableCell align="center">Games Contra</TableCell>
            <TableCell align="center">Saldo</TableCell>
            <TableCell
              align="center"
              sx={criteria === 'points' ? { fontWeight: 700 } : undefined}
            >
              Pontos
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ranking.map((entry, index) => (
            <TableRow
              key={entry.playerId}
              sx={
                index < highlightTop
                  ? { bgcolor: 'action.hover' }
                  : undefined
              }
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>
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
  );
}
