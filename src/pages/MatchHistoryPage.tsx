import { Button, Stack } from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { MatchHistoryList } from '../components/MatchHistoryList';
import { useChampionshipStore } from '../store/championshipStore';
import { getFinishedMatches, getTotalMatches } from '../utils/roundRobin';

export function MatchHistoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const current = useChampionshipStore((s) => s.championship);
  const getChampionshipById = useChampionshipStore((s) => s.getChampionshipById);

  const championship = id ? getChampionshipById(id) : current;
  const isRankingContext = !!id;
  const backTo = isRankingContext ? `/ranking/${id}` : championship?.status === 'finished' ? '/final' : '/torneio';

  useEffect(() => {
    if (!championship) {
      navigate('/');
    }
  }, [championship, navigate]);

  if (!championship) return null;

  const finishedCount = getFinishedMatches(championship.rounds);
  const totalCount = getTotalMatches(championship.rounds);

  return (
    <Layout title="Histórico de Partidas" maxWidth="md">
      <Stack spacing={{ xs: 2.5, sm: 3 }}>
        <PageHeader
          title="Histórico de Partidas"
          subtitle={`${championship.name} · ${finishedCount} de ${totalCount} partidas finalizadas`}
          backTo={backTo}
          backLabel="Voltar"
        />

        <MatchHistoryList championship={championship} onlyFinished />

        <Button
          variant="outlined"
          startIcon={<SportsTennisIcon />}
          onClick={() => navigate(backTo)}
          sx={{ alignSelf: { sm: 'flex-start' } }}
        >
          Voltar ao ranking
        </Button>
      </Stack>
    </Layout>
  );
}
