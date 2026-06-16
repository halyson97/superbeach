import type { MatchCategory, Player, Round } from '../types';
import {
  generateUniquePartnershipMatches,
  packScheduleIntoRounds,
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

type GenderRoundBalance = {
  playerIds: string[];
  waitCounts: Map<string, number>;
  lastWaiting: Set<string>;
};

function createBalanceState(playerIds: string[]): GenderRoundBalance {
  return {
    playerIds,
    waitCounts: new Map(playerIds.map((id) => [id, 0])),
    lastWaiting: new Set<string>(),
  };
}

function pickBalancedMatch(
  queue: TaggedMatchDef[],
  state: GenderRoundBalance,
): TaggedMatchDef | null {
  if (queue.length === 0) return null;

  let bestIndex = -1;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let i = 0; i < queue.length; i++) {
    const match = queue[i];
    const playing = new Set([...match.side1, ...match.side2]);
    const waiting = state.playerIds.filter((id) => !playing.has(id));

    const repeatedWaiters = waiting.filter((id) =>
      state.lastWaiting.has(id),
    ).length;
    const waitPenalty = waiting.reduce(
      (sum, id) => sum + (state.waitCounts.get(id) ?? 0),
      0,
    );
    const score = repeatedWaiters * 100 + waitPenalty;

    if (score < bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex < 0) return null;

  const selected = queue[bestIndex];
  const playing = new Set([...selected.side1, ...selected.side2]);
  const waiting = state.playerIds.filter((id) => !playing.has(id));
  for (const id of waiting) {
    state.waitCounts.set(id, (state.waitCounts.get(id) ?? 0) + 1);
  }
  state.lastWaiting = new Set(waiting);
  queue.splice(bestIndex, 1);
  return selected;
}

function takeOneMFRound(
  menQueue: TaggedMatchDef[],
  womenQueue: TaggedMatchDef[],
  courtCount: number,
  menBalance: GenderRoundBalance,
  womenBalance: GenderRoundBalance,
): TaggedMatchDef[] {
  if (courtCount <= 0) return [];

  const batch: TaggedMatchDef[] = [];

  const firstCategory =
    menQueue.length >= womenQueue.length ? 'men' : 'women';

  const firstMatch =
    firstCategory === 'men'
      ? pickBalancedMatch(menQueue, menBalance)
      : pickBalancedMatch(womenQueue, womenBalance);
  if (firstMatch) batch.push(firstMatch);

  if (batch.length < courtCount) {
    const secondMatch =
      firstCategory === 'men'
        ? pickBalancedMatch(womenQueue, womenBalance)
        : pickBalancedMatch(menQueue, menBalance);
    if (secondMatch) batch.push(secondMatch);
  }

  return batch;
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
  const menBalance = createBalanceState(menIds);
  const womenBalance = createBalanceState(womenIds);

  const segments: Round[] = [];

  for (const wave of mixedWaves) {
    segments.push(...packScheduleIntoRounds(wave, courtCount));

    const mfRound = takeOneMFRound(
      menQueue,
      womenQueue,
      courtCount,
      menBalance,
      womenBalance,
    );
    if (mfRound.length > 0) {
      segments.push(...packScheduleIntoRounds(mfRound, courtCount));
    }
  }

  if (menQueue.length > 0 || womenQueue.length > 0) {
    while (menQueue.length > 0 || womenQueue.length > 0) {
      const mfRound = takeOneMFRound(
        menQueue,
        womenQueue,
        courtCount,
        menBalance,
        womenBalance,
      );
      if (mfRound.length === 0) break;
      segments.push(...packScheduleIntoRounds(mfRound, courtCount));
    }

    if (menQueue.length > 0 || womenQueue.length > 0) {
      const remaining = buildInterleavedPool(menQueue, womenQueue);
      segments.push(...packScheduleIntoRounds(remaining, courtCount));
    }
  }

  return renumberRounds(segments);
}

export function countUniquePartnershipMatches(groupSize: number): number {
  if (groupSize % 4 === 0) return (groupSize * (groupSize - 1)) / 4;
  if (groupSize === 6) return 6;
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
