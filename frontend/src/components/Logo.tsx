import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { BRAND } from '../constants/brand';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  linkToHome?: boolean;
}

const sizes = {
  sm: { icon: 32, name: '1rem', tagline: '0.65rem' },
  md: { icon: 40, name: '1.15rem', tagline: '0.7rem' },
  lg: { icon: 72, name: '2rem', tagline: '0.85rem' },
};

export function Logo({
  size = 'md',
  showText = true,
  linkToHome = false,
}: LogoProps) {
  const s = sizes[size];

  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: size === 'lg' ? 2 : 1.25,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Box
        component="img"
        src="/logo.svg"
        alt={BRAND.name}
        sx={{
          width: s.icon,
          height: s.icon,
          borderRadius: size === 'lg' ? 3 : 2,
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(8, 145, 178, 0.25)',
        }}
      />
      {showText && (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: s.name,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 60%, #F97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {BRAND.name}
          </Typography>
          {size === 'lg' && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5, fontSize: s.tagline }}
            >
              {BRAND.shortTagline}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );

  if (linkToHome) {
    return (
      <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Box>
    );
  }

  return content;
}
