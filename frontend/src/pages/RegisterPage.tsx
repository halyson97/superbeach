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

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const hydrateGames = useChampionshipStore((s) => s.hydrate);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      await registerUser(data.name, data.email, data.password);
      await hydrateGames();
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao cadastrar');
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
            Criar conta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Cadastre-se para criar e salvar seus jogos
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                label="Nome"
                fullWidth
                autoComplete="name"
                {...register('name', { required: 'Nome obrigatório' })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
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
                autoComplete="new-password"
                {...register('password', {
                  required: 'Senha obrigatória',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <TextField
                label="Confirmar senha"
                type="password"
                fullWidth
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Confirme a senha',
                  validate: (value) =>
                    value === watch('password') || 'As senhas não coincidem',
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
              <Button type="submit" variant="contained" size="large" fullWidth>
                Cadastrar
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center' }}>
            Já tem conta?{' '}
            <Link component={RouterLink} to="/login">
              Entrar
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
}
