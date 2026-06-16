import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import type { Championship, RankingEntry } from '../types';
import { getPlayerName } from '../utils/ranking';

interface RankingTableProps {
  championship: Championship;
  ranking: RankingEntry[];
  highlightTop?: number;
}

export function RankingTable({
  championship,
  ranking,
  highlightTop = 0,
}: RankingTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
        Classificação
      </Typography>
      <Table size="small" sx={{ mt: 1 }}>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Jogador</TableCell>
            <TableCell align="center">Jogos</TableCell>
            <TableCell align="center">Vitórias</TableCell>
            <TableCell align="center">Derrotas</TableCell>
            <TableCell align="center">Games Pró</TableCell>
            <TableCell align="center">Games Contra</TableCell>
            <TableCell align="center">Saldo</TableCell>
            <TableCell align="center">Pontos</TableCell>
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
                {getPlayerName(championship.players, entry.playerId)}
              </TableCell>
              <TableCell align="center">{entry.gamesPlayed}</TableCell>
              <TableCell align="center">{entry.wins}</TableCell>
              <TableCell align="center">{entry.losses}</TableCell>
              <TableCell align="center">{entry.gamesFor}</TableCell>
              <TableCell align="center">{entry.gamesAgainst}</TableCell>
              <TableCell align="center">{entry.balance}</TableCell>
              <TableCell align="center">{entry.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
