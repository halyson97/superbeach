import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = 'Voltar',
  action,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      {backTo && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(backTo)}
          sx={{ mb: 1.5, ml: -1, color: 'text.secondary' }}
          size="small"
        >
          {backLabel}
        </Button>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.35rem', sm: '1.5rem' },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              color="text.secondary"
              sx={{ mt: 0.75, fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
    </Box>
  );
}
