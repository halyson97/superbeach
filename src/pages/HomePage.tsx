import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useChampionshipStore } from '../store/championshipStore';
import { getFinishedMatches, getTotalMatches } from '../utils/roundRobin';

export function HomePage() {
  const navigate = useNavigate();
  const championship = useChampionshipStore((s) => s.championship);
  const deleteChampionship = useChampionshipStore((s) => s.deleteChampionship);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasActiveChampionship =
    championship && championship.status === 'active';

  const handleDelete = () => {
    deleteChampionship();
    setConfirmDelete(false);
  };

  const handleContinue = () => {
    if (championship?.status === 'finished') {
      navigate('/final');
    } else {
      navigate('/torneio');
    }
  };

  return (
    <Layout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
            Beach Tennis
          </Typography>
          <Typography color="text.secondary">
            Organize campeonatos, gere confrontos e acompanhe a classificação.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/novo')}
          disabled={!!hasActiveChampionship}
          fullWidth
          sx={{ py: 1.5 }}
        >
          Novo Jogo
        </Button>

        {hasActiveChampionship && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Finalize ou exclua o campeonato atual para iniciar um novo.
          </Typography>
        )}

        {championship && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Jogo Atual
              </Typography>
              <Typography variant="h6" gutterBottom>
                {championship.name}
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  Criado em:{' '}
                  {new Date(championship.createdAt).toLocaleString('pt-BR')}
                </Typography>
                <Typography variant="body2">
                  Jogadores: {championship.playerCount}
                </Typography>
                <Typography variant="body2">
                  Partidas concluídas:{' '}
                  {getFinishedMatches(championship.rounds)} /{' '}
                  {getTotalMatches(championship.rounds)}
                </Typography>
                <Typography variant="body2">
                  Status:{' '}
                  {championship.status === 'active' ? 'Em andamento' : 'Finalizado'}
                </Typography>
              </Stack>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleContinue}
              >
                Continuar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDelete(true)}
              >
                Excluir
              </Button>
            </CardActions>
          </Card>
        )}
      </Stack>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Excluir campeonato?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta ação não pode ser desfeita. Todos os dados do campeonato serão
            removidos.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
