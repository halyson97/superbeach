import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Match, Player } from '../types';
import { formatSideNames } from '../utils/ranking';

interface ResultForm {
  score1: number;
  score2: number;
}

interface ResultDialogProps {
  open: boolean;
  match: Match | null;
  players: Player[];
  onClose: () => void;
  onSubmit: (matchId: string, score1: number, score2: number) => void;
}

export function ResultDialog({
  open,
  match,
  players,
  onClose,
  onSubmit,
}: ResultDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResultForm>();

  useEffect(() => {
    if (open && match) {
      reset({
        score1: match.score1 ?? ('' as unknown as number),
        score2: match.score2 ?? ('' as unknown as number),
      });
    }
  }, [open, match, reset]);

  if (!match) return null;

  const side1 = formatSideNames(match.side1Ids, players);
  const side2 = formatSideNames(match.side2Ids, players);

  const isEditing = match.status === 'finished';

  const handleClose = () => {
    reset();
    onClose();
  };

  const onFormSubmit = (data: ResultForm) => {
    onSubmit(match.id, Number(data.score1), Number(data.score2));
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEditing ? 'Editar Resultado' : 'Informar Resultado'}</DialogTitle>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Rodada {match.roundNumber} · Quadra {match.court}
            </Typography>

            <TextField
              label={side1}
              type="number"
              fullWidth
              slotProps={{ htmlInput: { min: 0 } }}
              {...register('score1', {
                required: 'Informe os games',
                min: { value: 0, message: 'Não pode ser negativo' },
                validate: (value, formValues) => {
                  const s1 = Number(value);
                  const s2 = Number(formValues.score2);
                  if (!isNaN(s2) && s1 === s2) return 'Não é permitido empate';
                  return true;
                },
              })}
              error={!!errors.score1}
              helperText={errors.score1?.message}
            />

            <TextField
              label={side2}
              type="number"
              fullWidth
              slotProps={{ htmlInput: { min: 0 } }}
              {...register('score2', {
                required: 'Informe os games',
                min: { value: 0, message: 'Não pode ser negativo' },
                validate: (value, formValues) => {
                  const s1 = Number(formValues.score1);
                  const s2 = Number(value);
                  if (!isNaN(s1) && s1 === s2) return 'Não é permitido empate';
                  return true;
                },
              })}
              error={!!errors.score2}
              helperText={errors.score2?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
          <Button onClick={handleClose} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" fullWidth>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
