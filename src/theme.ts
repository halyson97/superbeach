import { createTheme, alpha } from '@mui/material/styles';

const primary = '#0891B2';
const secondary = '#F97316';
const sand = '#FFFBEB';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primary,
      light: '#22D3EE',
      dark: '#0E7490',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: secondary,
      light: '#FB923C',
      dark: '#EA580C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F0FDFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
    success: {
      main: '#10B981',
    },
    divider: alpha('#0891B2', 0.12),
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, ${alpha(primary, 0.15)}, transparent),
            radial-gradient(ellipse 60% 40% at 100% 100%, ${alpha(secondary, 0.08)}, transparent)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha(primary, 0.08)}`,
          boxShadow: `0 4px 24px ${alpha('#0F172A', 0.06)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
        outlined: {
          border: `1px solid ${alpha(primary, 0.12)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: alpha('#FFFFFF', 0.85),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${alpha(primary, 0.1)}`,
          color: '#0F172A',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
        outlined: { borderWidth: 1.5 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '10px !important',
          '&.Mui-selected': {
            background: alpha(primary, 0.12),
            color: primary,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          margin: 16,
          width: 'calc(100% - 32px)',
          maxWidth: '100%',
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontWeight: 600,
          '&.Mui-active': { fontWeight: 700 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: sand,
          whiteSpace: 'nowrap',
        },
      },
    },
  },
});
