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
import { loadAppStorage, saveAppStorage } from '../services/storage';

interface ChampionshipStore {
  championship: Championship | null;
  history: Championship[];
  hydrate: () => void;
  getChampionshipById: (id: string) => Championship | null;
  createChampionship: (data: NewGameFormData) => void;
  deleteChampionship: () => void;
  deleteFromHistory: (id: string) => void;
  startMatch: (matchId: string) => void;
  submitResult: (matchId: string, score1: number, score2: number) => void;
  updateClassificationCriteria: (criteria: Championship['classificationCriteria']) => void;
  finishChampionship: () => void;
}

function persist(current: Championship | null, history: Championship[]) {
  saveAppStorage({ current, history });
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

function buildPlayers(
  names: string[],
  genders?: PlayerGender[],
): Player[] {
  return names.map((name, index) => ({
    id: generateId(),
    name: name.trim(),
    ...(genders ? { gender: genders[index] } : {}),
  }));
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

export const useChampionshipStore = create<ChampionshipStore>((set, get) => ({
  championship: null,
  history: [],

  hydrate: () => {
    const saved = loadAppStorage();
    const current = saved.current ? withRanking(saved.current) : null;
    const history = saved.history.map(withRanking);

    if (current || history.length > 0) {
      persist(current, history);
    }

    set({ championship: current, history: sortHistory(history) });
  },

  getChampionshipById: (id) => {
    const { championship, history } = get();
    if (championship?.id === id) return championship;
    return history.find((item) => item.id === id) ?? null;
  },

  createChampionship: (data) => {
    const { championship, history } = get();
    const createdAt = new Date().toISOString();
    const players = buildPlayers(data.playerNames, data.playerGenders);

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

    const updated = withRanking(newChampionship);

    let nextHistory = history;
    if (championship?.status === 'finished') {
      nextHistory = sortHistory([championship, ...history]);
    }

    persist(updated, nextHistory);
    set({ championship: updated, history: nextHistory });
  },

  deleteChampionship: () => {
    const { history } = get();
    persist(null, history);
    set({ championship: null });
  },

  deleteFromHistory: (id) => {
    const { championship, history } = get();
    const nextHistory = history.filter((item) => item.id !== id);
    persist(championship, nextHistory);
    set({ history: nextHistory });
  },

  startMatch: (matchId) => {
    const { championship, history } = get();
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

    persist(updated, history);
    set({ championship: updated });
  },

  submitResult: (matchId, score1, score2) => {
    const { championship, history } = get();
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

    const withUpdatedRanking = withRanking(updated);
    persist(withUpdatedRanking, history);
    set({ championship: withUpdatedRanking });
  },

  updateClassificationCriteria: (criteria) => {
    const { championship, history } = get();
    if (!championship) return;

    const updated = withRanking({
      ...championship,
      classificationCriteria: criteria,
    });

    persist(updated, history);
    set({ championship: updated });
  },

  finishChampionship: () => {
    const { championship, history } = get();
    if (!championship) return;

    const updated = withRanking({
      ...championship,
      status: 'finished',
      finishedAt: new Date().toISOString(),
    });

    persist(updated, history);
    set({ championship: updated });
  },
}));
