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
import { clearChampionship, loadChampionship, saveChampionship } from '../services/storage';

interface ChampionshipStore {
  championship: Championship | null;
  hydrate: () => void;
  createChampionship: (data: NewGameFormData) => void;
  deleteChampionship: () => void;
  startMatch: (matchId: string) => void;
  submitResult: (matchId: string, score1: number, score2: number) => void;
  updateClassificationCriteria: (criteria: Championship['classificationCriteria']) => void;
  finishChampionship: () => void;
}

function persist(championship: Championship | null) {
  saveChampionship(championship);
}

function formatChampionshipName(date: Date): string {
  return `Beach Tennis - ${date.toLocaleDateString('pt-BR', {
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

export const useChampionshipStore = create<ChampionshipStore>((set, get) => ({
  championship: null,

  hydrate: () => {
    const saved = loadChampionship();
    if (saved) {
      saved.ranking = recalculateRanking(saved);
      saveChampionship(saved);
      set({ championship: saved });
    }
  },

  createChampionship: (data) => {
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

    const championship: Championship = {
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

    championship.ranking = recalculateRanking(championship);
    persist(championship);
    set({ championship });
  },

  deleteChampionship: () => {
    clearChampionship();
    set({ championship: null });
  },

  startMatch: (matchId) => {
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

    persist(updated);
    set({ championship: updated });
  },

  submitResult: (matchId, score1, score2) => {
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

    updated.ranking = recalculateRanking(updated);
    persist(updated);
    set({ championship: updated });
  },

  updateClassificationCriteria: (criteria) => {
    const { championship } = get();
    if (!championship) return;

    const updated: Championship = {
      ...championship,
      classificationCriteria: criteria,
    };
    updated.ranking = recalculateRanking(updated);

    persist(updated);
    set({ championship: updated });
  },

  finishChampionship: () => {
    const { championship } = get();
    if (!championship) return;

    const updated: Championship = {
      ...championship,
      status: 'finished',
      ranking: recalculateRanking(championship),
    };

    persist(updated);
    set({ championship: updated });
  },
}));
