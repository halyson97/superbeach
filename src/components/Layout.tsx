import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Logo } from './Logo';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function Layout({ children, title, maxWidth = 'lg' }: LayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
          <Logo size="sm" linkToHome />
          {title && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                ml: 'auto',
                maxWidth: { xs: 120, sm: 240 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}
            >
              {title}
            </Typography>
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
