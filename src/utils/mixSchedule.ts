import type { MatchCategory, Player, Round } from '../types';
import {
  generateUniquePartnershipMatches,
  packScheduleIntoRounds,
  selectMaxMatchesForRound,
} from './roundRobin';

type TaggedMatchDef = {
  side1: string[];
  side2: string[];
  category: MatchCategory;
};

function tagMatches(
  defs: { side1: string[]; side2: string[] }[],
  category: MatchCategory,
): TaggedMatchDef[] {
  return defs.map((def) => ({ ...def, category }));
}

function matchKey(m: TaggedMatchDef): string {
  const side = (ids: string[]) => [...ids].sort().join('+');
  return `${m.category}|${side(m.side1)}|${side(m.side2)}`;
}

function removeFromQueue(queue: TaggedMatchDef[], match: TaggedMatchDef): void {
  const key = matchKey(match);
  const idx = queue.findIndex((m) => matchKey(m) === key);
  if (idx >= 0) queue.splice(idx, 1);
}

function buildInterleavedPool(
  menQueue: TaggedMatchDef[],
  womenQueue: TaggedMatchDef[],
): TaggedMatchDef[] {
  const pool: TaggedMatchDef[] = [];
  const max = Math.max(menQueue.length, womenQueue.length);
  for (let i = 0; i < max; i++) {
    if (i < menQueue.length) pool.push(menQueue[i]);
    if (i < womenQueue.length) pool.push(womenQueue[i]);
  }
  return pool;
}

/** Extrai até uma rodada de partidas masculinas/femininas sem conflito de jogadores. */
function takeOneMFRound(
  menQueue: TaggedMatchDef[],
  womenQueue: TaggedMatchDef[],
  courtCount: number,
): TaggedMatchDef[] {
  if (menQueue.length === 0 && womenQueue.length === 0) return [];

  const pool = buildInterleavedPool(menQueue, womenQueue);
  const selected = selectMaxMatchesForRound(pool, courtCount);
  const batch = selected.map((idx) => pool[idx]);

  for (const match of batch) {
    removeFromQueue(menQueue, match);
    removeFromQueue(womenQueue, match);
  }

  return batch;
}

function renumberRounds(rounds: Round[]): Round[] {
  return rounds.map((round, index) => ({
    number: index + 1,
    matches: round.matches.map((match) => ({
      ...match,
      roundNumber: index + 1,
    })),
  }));
}

/**
 * Rodízio bipartido: cada homem forma dupla com cada mulher exatamente uma vez.
 * Retorna ondas de n/2 partidas onde todos jogam simultaneamente.
 */
function generateMixedWaves(
  menIds: string[],
  womenIds: string[],
): TaggedMatchDef[][] {
  const n = menIds.length;
  const waves: TaggedMatchDef[][] = [];

  for (let round = 0; round < n; round++) {
    const pairs: [string, string][] = [];

    for (let i = 0; i < n; i++) {
      pairs.push([menIds[i], womenIds[(i + round) % n]]);
    }

    const wave: TaggedMatchDef[] = [];
    for (let i = 0; i < pairs.length; i += 2) {
      const [m1, w1] = pairs[i];
      const [m2, w2] = pairs[i + 1];
      wave.push({
        side1: [m1, w1],
        side2: [m2, w2],
        category: 'mixed',
      });
    }

    waves.push(wave);
  }

  return waves;
}

export function generateMixSchedule(
  players: Player[],
  courtCount: number,
): Round[] {
  const menIds = players
    .filter((p) => p.gender === 'male')
    .map((p) => p.id);
  const womenIds = players
    .filter((p) => p.gender === 'female')
    .map((p) => p.id);

  const menQueue = tagMatches(
    generateUniquePartnershipMatches(menIds),
    'men',
  );
  const womenQueue = tagMatches(
    generateUniquePartnershipMatches(womenIds),
    'women',
  );
  const mixedWaves = generateMixedWaves(menIds, womenIds);

  const segments: Round[] = [];

  for (const wave of mixedWaves) {
    segments.push(...packScheduleIntoRounds(wave, courtCount));

    const mfRound = takeOneMFRound(menQueue, womenQueue, courtCount);
    if (mfRound.length > 0) {
      segments.push(...packScheduleIntoRounds(mfRound, courtCount));
    }
  }

  if (menQueue.length > 0 || womenQueue.length > 0) {
    const remaining = buildInterleavedPool(menQueue, womenQueue);
    segments.push(...packScheduleIntoRounds(remaining, courtCount));
  }

  return renumberRounds(segments);
}

export function countUniquePartnershipMatches(groupSize: number): number {
  if (groupSize % 4 === 0) return (groupSize * (groupSize - 1)) / 4;
  if (groupSize === 6) return 7;
  return Math.floor((groupSize * (groupSize - 1)) / 4);
}

export function getMixMatchCounts(playerCount: number) {
  const n = playerCount / 2;
  const sameGender = countUniquePartnershipMatches(n);
  const mixed = (n * n) / 2;

  return {
    men: sameGender,
    women: sameGender,
    mixed,
    total: sameGender * 2 + mixed,
  };
}

export function partnershipKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

export function hasDuplicatePartnerships(
  matches: {
    side1?: string[];
    side2?: string[];
    side1Ids?: string[];
    side2Ids?: string[];
    category?: MatchCategory;
  }[],
  category: MatchCategory,
): boolean {
  const seen = new Set<string>();

  for (const match of matches.filter((m) => m.category === category)) {
    for (const side of [
      match.side1 ?? match.side1Ids,
      match.side2 ?? match.side2Ids,
    ]) {
      if (!side?.[0] || !side?.[1]) continue;
      const key = partnershipKey(side[0], side[1]);
      if (seen.has(key)) return true;
      seen.add(key);
    }
  }

  return false;
}

/** Retorna categorias presentes em cada rodada (útil para testes). */
export function getRoundCategoryPattern(rounds: Round[]): MatchCategory[][] {
  return rounds.map((round) => round.matches.map((m) => m.category!));
}
