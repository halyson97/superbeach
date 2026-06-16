import { AppBar, Box, Container, Toolbar, Typography, Button, Stack } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuthStore } from '../store/authStore';
import { useChampionshipStore } from '../store/championshipStore';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg';
  showAuth?: boolean;
}

export function Layout({ children, title, maxWidth = 'lg', showAuth = true }: LayoutProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    useChampionshipStore.setState({ championship: null, history: [], isLoading: false });
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
          <Logo size="sm" linkToHome={isAuthenticated} />
          {title && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                ml: { xs: 0, sm: 1 },
                maxWidth: { xs: 100, sm: 200 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                display: { xs: title.length > 20 ? 'none' : 'block', sm: 'block' },
              }}
            >
              {title}
            </Typography>
          )}
          {showAuth && isAuthenticated && user && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ ml: 'auto', alignItems: 'center' }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  maxWidth: 160,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name}
              </Typography>
              <Button
                size="small"
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ color: 'text.secondary' }}
              >
                Sair
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, pb: { xs: 3, sm: 4 } }}>
        <Container
          maxWidth={maxWidth}
          sx={{
            py: { xs: 2, sm: 3 },
            px: { xs: 1.5, sm: 3 },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}
