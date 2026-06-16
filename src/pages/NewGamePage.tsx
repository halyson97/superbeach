import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useChampionshipStore } from '../store/championshipStore';
import type { ClassificationCriteria, GameType, PlayerGender } from '../types';

const PLAYER_COUNT_OPTIONS = [6, 8, 12, 16];
const MIX_PLAYER_COUNT_OPTIONS = [8, 12, 16];
const COURT_COUNT_OPTIONS = [1, 2, 3, 4];

function createDefaultPlayers(count: number, isMix: boolean) {
  return Array.from({ length: count }, (_, index) => ({
    name: '',
    gender: (isMix
      ? index < count / 2
        ? 'male'
        : 'female'
      : 'male') as PlayerGender,
  }));
}

interface FormValues {
  gameType: GameType;
  playerCount: number;
  courtCount: number;
  classificationCriteria: ClassificationCriteria;
  players: { name: string; gender: PlayerGender }[];
  pairs: { player1: string; player2: string }[];
}

const STEPS = ['Configuração', 'Jogadores', 'Duplas'];

export function NewGamePage() {
  const navigate = useNavigate();
  const createChampionship = useChampionshipStore((s) => s.createChampionship);
  const [activeStep, setActiveStep] = useState(0);
  const [formError, setFormError] = useState('');

  const { control, watch, handleSubmit, setValue, getValues, trigger } =
    useForm<FormValues>({
      defaultValues: {
        gameType: 'individual',
        playerCount: 8,
        courtCount: 2,
        classificationCriteria: 'wins',
        players: createDefaultPlayers(8, false),
        pairs: Array.from({ length: 4 }, () => ({ player1: '', player2: '' })),
      },
    });

  const gameType = watch('gameType');
  const playerCount = watch('playerCount');

  const { fields, replace } = useFieldArray({ control, name: 'players' });
  const { fields: pairFields, replace: replacePairs } = useFieldArray({
    control,
    name: 'pairs',
  });

  const isMix = gameType === 'mix';
  const playerCountOptions = isMix ? MIX_PLAYER_COUNT_OPTIONS : PLAYER_COUNT_OPTIONS;

  const handlePlayerCountChange = (count: number) => {
    setValue('playerCount', count);
    replace(createDefaultPlayers(count, isMix));
    if (gameType === 'fixed_double') {
      replacePairs(
        Array.from({ length: count / 2 }, () => ({ player1: '', player2: '' })),
      );
    }
  };

  const handleGameTypeChange = (type: GameType) => {
    setValue('gameType', type);

    if (type === 'mix') {
      const count = playerCount < 8 ? 8 : playerCount;
      setValue('playerCount', count);
      replace(createDefaultPlayers(count, true));
      return;
    }

    replace(createDefaultPlayers(playerCount, false));

    if (type === 'fixed_double') {
      replacePairs(
        Array.from({ length: playerCount / 2 }, () => ({
          player1: '',
          player2: '',
        })),
      );
    }
  };

  const validatePlayers = async (): Promise<boolean> => {
    const valid = await trigger('players');
    if (!valid) return false;

    const players = getValues('players').map((p) => p.name.trim());
    if (players.some((name) => !name)) {
      setFormError('Não é permitido nomes vazios.');
      return false;
    }

    const unique = new Set(players.map((n) => n.toLowerCase()));
    if (unique.size !== players.length) {
      setFormError('Não é permitido nomes duplicados.');
      return false;
    }

    if (players.length !== playerCount) {
      setFormError('A quantidade de nomes deve coincidir com a selecionada.');
      return false;
    }

    if (gameType === 'mix') {
      const genders = getValues('players').map((p) => p.gender);
      const maleCount = genders.filter((g) => g === 'male').length;
      const femaleCount = genders.filter((g) => g === 'female').length;
      const expected = playerCount / 2;

      if (maleCount !== expected || femaleCount !== expected) {
        setFormError(
          `O Mix exige ${expected} homens e ${expected} mulheres.`,
        );
        return false;
      }
    }

    setFormError('');
    return true;
  };

  const validatePairs = (): boolean => {
    const players = getValues('players').map((p) => p.name.trim());
    const pairs = getValues('pairs');
    const used = new Set<string>();

    for (const pair of pairs) {
      if (!pair.player1 || !pair.player2) {
        setFormError('Todas as duplas devem ser preenchidas.');
        return false;
      }
      if (pair.player1 === pair.player2) {
        setFormError('Um jogador não pode formar dupla consigo mesmo.');
        return false;
      }
      if (!players.includes(pair.player1) || !players.includes(pair.player2)) {
        setFormError('Duplas devem usar jogadores cadastrados.');
        return false;
      }
      used.add(pair.player1);
      used.add(pair.player2);
    }

    if (used.size !== players.length) {
      setFormError('Cada jogador deve pertencer a exatamente uma dupla.');
      return false;
    }

    setFormError('');
    return true;
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      setActiveStep(1);
      return;
    }

    if (activeStep === 1) {
      const ok = await validatePlayers();
      if (!ok) return;

      if (gameType === 'fixed_double') {
        const names = getValues('players').map((p) => p.name.trim());
        replacePairs(
          Array.from({ length: playerCount / 2 }, (_, i) => ({
            player1: names[i * 2] ?? '',
            player2: names[i * 2 + 1] ?? '',
          })),
        );
        setActiveStep(2);
      } else {
        handleSubmit(onSubmit)();
      }
      return;
    }

    if (activeStep === 2) {
      if (!validatePairs()) return;
      handleSubmit(onSubmit)();
    }
  };

  const onSubmit = (data: FormValues) => {
    createChampionship({
      gameType: data.gameType,
      playerCount: data.playerCount,
      courtCount: data.courtCount,
      classificationCriteria: data.classificationCriteria,
      playerNames: data.players.map((p) => p.name.trim()),
      playerGenders:
        data.gameType === 'mix'
          ? data.players.map((p) => p.gender)
          : undefined,
      pairs:
        data.gameType === 'fixed_double'
          ? data.pairs.map((p) => [p.player1, p.player2] as [string, string])
          : undefined,
    });
    navigate('/torneio');
  };

  const steps =
    gameType === 'fixed_double' ? STEPS : STEPS.slice(0, 2);

  return (
    <Layout title="Novo Jogo">
      <Stack spacing={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Voltar
        </Button>

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {formError && <Alert severity="error">{formError}</Alert>}

        {activeStep === 0 && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Tipo de Jogo</FormLabel>
                <Controller
                  name="gameType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      onChange={(e) =>
                        handleGameTypeChange(e.target.value as GameType)
                      }
                    >
                      <FormControlLabel
                        value="individual"
                        control={<Radio />}
                        label="Individual (duplas rotativas — cada um joga com todos)"
                      />
                      <FormControlLabel
                        value="fixed_double"
                        control={<Radio />}
                        label="Dupla Fixa"
                      />
                      <FormControlLabel
                        value="mix"
                        control={<Radio />}
                        label="Mix (homens, mulheres e misto)"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>

              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1 }}>Quantidade de Jogadores</FormLabel>
                <Controller
                  name="playerCount"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      onChange={(e) =>
                        handlePlayerCountChange(Number(e.target.value))
                      }
                    >
                      {playerCountOptions.map((count) => (
                        <MenuItem key={count} value={count}>
                          {count} jogadores
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {isMix && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Metade homens, metade mulheres. Mínimo 8 jogadores.
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1 }}>Quantidade de Quadras</FormLabel>
                <Controller
                  name="courtCount"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      {COURT_COUNT_OPTIONS.map((count) => (
                        <MenuItem key={count} value={count}>
                          {count} {count === 1 ? 'quadra' : 'quadras'}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Critério de Classificação</FormLabel>
                <Controller
                  name="classificationCriteria"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="wins"
                        control={<Radio />}
                        label="Vitórias (1 vitória = 1 ponto de vitória)"
                      />
                      <FormControlLabel
                        value="points"
                        control={<Radio />}
                        label="Pontos (soma dos games marcados em cada partida)"
                      />
                    </RadioGroup>
                  )}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Vitórias: desempate por saldo → games pró → sorteio.
                  Pontos: desempate por vitórias → saldo → sorteio.
                </Typography>
              </FormControl>
            </Stack>
          </Paper>
        )}

        {activeStep === 1 && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cadastro dos Jogadores
            </Typography>
            {isMix && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Cadastre {playerCount / 2} homens e {playerCount / 2} mulheres.
              </Typography>
            )}
            <Stack spacing={2}>
              {fields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
                >
                  <Controller
                    name={`players.${index}.name`}
                    control={control}
                    rules={{ required: 'Nome obrigatório' }}
                    render={({ field: inputField, fieldState }) => (
                      <TextField
                        {...inputField}
                        label={
                          isMix
                            ? `Jogador ${index + 1}`
                            : `Jogador ${index + 1}`
                        }
                        sx={{ flex: 1, minWidth: 160 }}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                  {isMix && (
                    <Controller
                      name={`players.${index}.gender`}
                      control={control}
                      render={({ field: genderField }) => (
                        <FormControl sx={{ minWidth: 140 }}>
                          <FormLabel>Gênero</FormLabel>
                          <Select {...genderField}>
                            <MenuItem value="male">Homem</MenuItem>
                            <MenuItem value="female">Mulher</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {activeStep === 2 && gameType === 'fixed_double' && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Formação das Duplas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Defina as duplas fixas para o campeonato.
            </Typography>
            <Stack spacing={2}>
              {pairFields.map((field, index) => {
                const playerNames = getValues('players').map((p) => p.name.trim());
                return (
                  <Box key={field.id} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Controller
                      name={`pairs.${index}.player1`}
                      control={control}
                      render={({ field: f }) => (
                        <FormControl sx={{ flex: 1, minWidth: 140 }}>
                          <FormLabel>Dupla {index + 1} - Jogador 1</FormLabel>
                          <Select {...f} displayEmpty>
                            <MenuItem value="" disabled>
                              Selecione
                            </MenuItem>
                            {playerNames.map((name) => (
                              <MenuItem key={name} value={name}>
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                    <Controller
                      name={`pairs.${index}.player2`}
                      control={control}
                      render={({ field: f }) => (
                        <FormControl sx={{ flex: 1, minWidth: 140 }}>
                          <FormLabel>Jogador 2</FormLabel>
                          <Select {...f} displayEmpty>
                            <MenuItem value="" disabled>
                              Selecione
                            </MenuItem>
                            {playerNames.map((name) => (
                              <MenuItem key={name} value={name}>
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        )}

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep((s) => s - 1)}>Anterior</Button>
          )}
          <Button variant="contained" onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Iniciar Campeonato' : 'Próximo'}
          </Button>
        </Stack>
      </Stack>
    </Layout>
  );
}
