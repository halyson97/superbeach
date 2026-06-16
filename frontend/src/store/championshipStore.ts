import { create } from 'zustand';
import type {
  Championship,
  NewGameFormData,
  Player,
  PlayerGender,
  Team,
} from '../types';
import { generateId } from '../utils/id';
import {
  generateDoublesSchedule,
  generateIndividualSchedule,
} from '../utils/roundRobin';
import { generateMixSchedule } from '../utils/mixSchedule';
import { recalculateRanking } from '../utils/ranking';
import * as gamesApi from '../services/gamesApi';

interface ChampionshipStore {
  championship: Championship | null;
  history: Championship[];
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  getChampionshipById: (id: string) => Championship | null;
  createChampionship: (data: NewGameFormData) => Promise<void>;
  deleteChampionship: () => Promise<void>;
  deleteFromHistory: (id: string) => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  submitResult: (matchId: string, score1: number, score2: number) => Promise<void>;
  updateClassificationCriteria: (criteria: Championship['classificationCriteria']) => Promise<void>;
  finishChampionship: () => Promise<void>;
  clearError: () => void;
}

function withRanking(championship: Championship): Championship {
  return {
    ...championship,
    ranking: recalculateRanking(championship),
  };
}

function formatChampionshipName(date: Date): string {
  return `Super Beach - ${date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function buildPlayers(names: string[], genders?: PlayerGender[]): Player[] {
  return names.map((name, index) => ({
    id: generateId(),
    name: name.trim(),
    ...(genders ? { gender: genders[index] } : {}),
  }));
}

function shufflePlayers(players: Player[]): Player[] {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildTeams(players: Player[], pairs: [string, string][]): Team[] {
  const playerByName = new Map(players.map((p) => [p.name, p]));

  return pairs.map(([name1, name2]) => {
    const p1 = playerByName.get(name1)!;
    const p2 = playerByName.get(name2)!;
    return {
      id: generateId(),
      player1Id: p1.id,
      player2Id: p2.id,
      name: `${p1.name} / ${p2.name}`,
    };
  });
}

function sortHistory(history: Championship[]): Championship[] {
  return [...history].sort((a, b) => {
    const dateA = a.finishedAt ?? a.createdAt;
    const dateB = b.finishedAt ?? b.createdAt;
    return dateB.localeCompare(dateA);
  });
}

async function syncGame(championship: Championship): Promise<Championship> {
  return gamesApi.updateGame(withRanking(championship));
}

export const useChampionshipStore = create<ChampionshipStore>((set, get) => ({
  championship: null,
  history: [],
  isLoading: false,
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const { current, history } = await gamesApi.listGames();
      const mappedCurrent = current ? withRanking(current) : null;
      const mappedHistory = history.map(withRanking);
      set({
        championship: mappedCurrent,
        history: sortHistory(mappedHistory),
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar jogos',
      });
    }
  },

  getChampionshipById: (id) => {
    const { championship, history } = get();
    if (championship?.id === id) return championship;
    return history.find((item) => item.id === id) ?? null;
  },

  createChampionship: async (data) => {
    const createdAt = new Date().toISOString();
    const basePlayers = buildPlayers(data.playerNames, data.playerGenders);
    const players = data.randomizePlayers
      ? shufflePlayers(basePlayers)
      : basePlayers;

    let teams: Team[] | undefined;
    let rounds;

    if (data.gameType === 'fixed_double' && data.pairs) {
      teams = buildTeams(players, data.pairs);
      rounds = generateDoublesSchedule(teams, data.courtCount);
    } else if (data.gameType === 'mix') {
      rounds = generateMixSchedule(players, data.courtCount);
    } else {
      rounds = generateIndividualSchedule(players, data.courtCount);
    }

    const newChampionship: Championship = {
      id: generateId(),
      name: formatChampionshipName(new Date(createdAt)),
      createdAt,
      gameType: data.gameType,
      playerCount: data.playerCount,
      courtCount: data.courtCount,
      classificationCriteria: data.classificationCriteria,
      players,
      teams,
      rounds,
      ranking: [],
      status: 'active',
    };

    const withRank = withRanking(newChampionship);
    const saved = await gamesApi.createGame(withRank);
    const { current, history } = await gamesApi.listGames();

    set({
      championship: current ? withRanking(current) : withRanking(saved),
      history: sortHistory(history.map(withRanking)),
    });
  },

  deleteChampionship: async () => {
    const { championship } = get();
    if (!championship) return;

    await gamesApi.deleteGame(championship.id);
    set({ championship: null });
  },

  deleteFromHistory: async (id) => {
    await gamesApi.deleteGame(id);
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
    }));
  },

  startMatch: async (matchId) => {
    const { championship } = get();
    if (!championship) return;

    const updated: Championship = {
      ...championship,
      rounds: championship.rounds.map((round) => ({
        ...round,
        matches: round.matches.map((match) =>
          match.id === matchId && match.status === 'not_started'
            ? { ...match, status: 'in_progress' as const }
            : match,
        ),
      })),
    };

    const saved = await syncGame(updated);
    set({ championship: withRanking(saved) });
  },

  submitResult: async (matchId, score1, score2) => {
    const { championship } = get();
    if (!championship) return;

    const updated: Championship = {
      ...championship,
      rounds: championship.rounds.map((round) => ({
        ...round,
        matches: round.matches.map((match) =>
          match.id === matchId
            ? {
                ...match,
                status: 'finished' as const,
                score1,
                score2,
              }
            : match,
        ),
      })),
    };

    const saved = await syncGame(updated);
    set({ championship: withRanking(saved) });
  },

  updateClassificationCriteria: async (criteria) => {
    const { championship } = get();
    if (!championship) return;

    const updated = withRanking({
      ...championship,
      classificationCriteria: criteria,
    });

    const saved = await syncGame(updated);
    set({ championship: withRanking(saved) });
  },

  finishChampionship: async () => {
    const { championship } = get();
    if (!championship) return;

    const updated = withRanking({
      ...championship,
      status: 'finished',
      finishedAt: new Date().toISOString(),
    });

    const saved = await syncGame(updated);
    set({ championship: withRanking(saved) });
  },

  clearError: () => set({ error: null }),
}));
