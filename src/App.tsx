import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { HomePage } from './pages/HomePage';
import { NewGamePage } from './pages/NewGamePage';
import { TournamentPage } from './pages/TournamentPage';
import { FinalPage } from './pages/FinalPage';
import { MatchHistoryPage } from './pages/MatchHistoryPage';
import { useChampionshipStore } from './store/championshipStore';
import { theme } from './theme';

function AppRoutes() {
  const hydrate = useChampionshipStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/novo" element={<NewGamePage />} />
      <Route path="/torneio" element={<TournamentPage />} />
      <Route path="/final" element={<FinalPage />} />
      <Route path="/ranking/:id" element={<FinalPage />} />
      <Route path="/partidas" element={<MatchHistoryPage />} />
      <Route path="/ranking/:id/partidas" element={<MatchHistoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
