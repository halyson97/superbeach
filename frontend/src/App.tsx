import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { HomePage } from './pages/HomePage';
import { NewGamePage } from './pages/NewGamePage';
import { TournamentPage } from './pages/TournamentPage';
import { FinalPage } from './pages/FinalPage';
import { MatchHistoryPage } from './pages/MatchHistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SharePage } from './pages/SharePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useChampionshipStore } from './store/championshipStore';
import { useAuthStore } from './store/authStore';
import { theme } from './theme';

function AppRoutes() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrateGames = useChampionshipStore((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      hydrateGames();
    }
  }, [isAuthenticated, hydrateGames]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/acompanhar/:shareToken" element={<SharePage />} />

      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/novo" element={<ProtectedRoute><NewGamePage /></ProtectedRoute>} />
      <Route path="/torneio" element={<ProtectedRoute><TournamentPage /></ProtectedRoute>} />
      <Route path="/final" element={<ProtectedRoute><FinalPage /></ProtectedRoute>} />
      <Route path="/ranking/:id" element={<ProtectedRoute><FinalPage /></ProtectedRoute>} />
      <Route path="/partidas" element={<ProtectedRoute><MatchHistoryPage /></ProtectedRoute>} />
      <Route path="/ranking/:id/partidas" element={<ProtectedRoute><MatchHistoryPage /></ProtectedRoute>} />

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
