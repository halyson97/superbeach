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

  const menMatches = tagMatches(
    generateUniquePartnershipMatches(menIds),
    'men',
  );
  const womenMatches = tagMatches(
    generateUniquePartnershipMatches(womenIds),
    'women',
  );
  const mixedWaves = generateMixedWaves(menIds, womenIds);

  // Ondas mistas primeiro (preenchem todas as quadras), depois masculino/feminino intercalado
  const combined: TaggedMatchDef[] = [];
  for (const wave of mixedWaves) {
    combined.push(...wave);
  }

  const maxSame = Math.max(menMatches.length, womenMatches.length);
  for (let i = 0; i < maxSame; i++) {
    if (i < menMatches.length) combined.push(menMatches[i]);
    if (i < womenMatches.length) combined.push(womenMatches[i]);
  }

  return packScheduleIntoRounds(combined, courtCount);
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
  matches: { side1: string[]; side2: string[]; category?: MatchCategory }[],
  category: MatchCategory,
): boolean {
  const seen = new Set<string>();

  for (const match of matches.filter((m) => m.category === category)) {
    for (const side of [match.side1, match.side2]) {
      const key = partnershipKey(side[0], side[1]);
      if (seen.has(key)) return true;
      seen.add(key);
    }
  }

  return false;
}
