import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  Link,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Logo } from '../components/Logo';
import { useAuthStore } from '../store/authStore';
import { useChampionshipStore } from '../store/championshipStore';
import { ApiError } from '../services/api';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const hydrateGames = useChampionshipStore((s) => s.hydrate);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login(data.email, data.password);
      await hydrateGames();
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao fazer login');
    }
  };

  return (
    <Layout maxWidth="sm" showAuth={false}>
      <Box sx={{ maxWidth: 400, mx: 'auto', pt: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Logo size="lg" />
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Entrar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Acesse sua conta para gerenciar seus jogos
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                autoComplete="email"
                {...register('email', { required: 'Email obrigatório' })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                label="Senha"
                type="password"
                fullWidth
                autoComplete="current-password"
                {...register('password', { required: 'Senha obrigatória' })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <Button type="submit" variant="contained" size="large" fullWidth>
                Entrar
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center' }}>
            Não tem conta?{' '}
            <Link component={RouterLink} to="/cadastro">
              Cadastre-se
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
}
