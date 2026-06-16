import type { Match, MatchCategory, Player, Round, Team } from '../types';
import { generateId } from './id';

type MatchDef = {
  side1: string[];
  side2: string[];
  category?: MatchCategory;
};

function createMatch(
  side1Ids: string[],
  side2Ids: string[],
  roundNumber: number,
  court: number,
  category?: MatchCategory,
): Match {
  return {
    id: generateId(),
    roundNumber,
    court,
    status: 'not_started',
    side1Ids,
    side2Ids,
    category,
  };
}

function partnershipKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

function getMatchPlayers(game: MatchDef): string[] {
  return [...game.side1, ...game.side2];
}

function conflictsWithSelection(
  selected: number[],
  candidate: number,
  remaining: MatchDef[],
): boolean {
  const busy = new Set<string>();
  for (const idx of selected) {
    getMatchPlayers(remaining[idx]).forEach((id) => busy.add(id));
  }
  return getMatchPlayers(remaining[candidate]).some((id) => busy.has(id));
}

/**
 * Seleciona o maior conjunto de partidas sem conflito de jogadores (até courtCount).
 */
export function selectMaxMatchesForRound(
  remaining: MatchDef[],
  courtCount: number,
): number[] {
  let best: number[] = [];

  function search(start: number, selected: number[]) {
    if (selected.length > best.length) {
      best = [...selected];
    }
    if (selected.length >= courtCount) return;

    for (let i = start; i < remaining.length; i++) {
      if (conflictsWithSelection(selected, i, remaining)) continue;
      search(i + 1, [...selected, i]);
    }
  }

  search(0, []);
  return best;
}

function sortRemainingForPacking(remaining: MatchDef[]): void {
  const frequency = new Map<string, number>();
  for (const game of remaining) {
    for (const id of getMatchPlayers(game)) {
      frequency.set(id, (frequency.get(id) ?? 0) + 1);
    }
  }

  const bottleneck = (game: MatchDef) =>
    Math.min(...getMatchPlayers(game).map((id) => frequency.get(id) ?? 0));

  remaining.sort((a, b) => bottleneck(a) - bottleneck(b));
}

/**
 * Agrupa partidas em rodadas otimizando o uso das quadras.
 * Nenhum jogador disputa duas partidas na mesma rodada.
 */
function packScheduleIntoRounds(
  schedule: MatchDef[],
  courtCount: number,
): Round[] {
  const remaining = [...schedule];
  const rounds: Round[] = [];
  let roundNumber = 1;

  while (remaining.length > 0) {
    sortRemainingForPacking(remaining);

    let selected = selectMaxMatchesForRound(remaining, courtCount);

    if (selected.length === 0) {
      selected = [0];
    }

    const roundMatches = selected.map((idx, courtIdx) =>
      createMatch(
        remaining[idx].side1,
        remaining[idx].side2,
        roundNumber,
        courtIdx + 1,
        remaining[idx].category,
      ),
    );

    selected
      .sort((a, b) => b - a)
      .forEach((idx) => remaining.splice(idx, 1));

    rounds.push({ number: roundNumber, matches: roundMatches });
    roundNumber++;
  }

  return rounds;
}

/**
 * 1-factorização de K_n (método do círculo).
 * Gera n-1 rodadas de parceiros; cada rodada tem n/4 confrontos possíveis.
 */
function oneFactorization(playerIds: string[]): [string, string][][] {
  const n = playerIds.length;
  const factors: [string, string][][] = [];
  const others = Array.from({ length: n - 1 }, (_, i) => i + 1);

  for (let round = 0; round < n - 1; round++) {
    const pairs: [string, string][] = [];

    pairs.push([playerIds[0], playerIds[others[0]]]);

    for (let i = 1; i < n / 2; i++) {
      pairs.push([
        playerIds[others[i]],
        playerIds[others[n - 1 - i]],
      ]);
    }

    factors.push(pairs);

    const last = others.pop()!;
    others.unshift(last);
  }

  return factors;
}

function factorsToMatchDefs(factors: [string, string][][]): MatchDef[] {
  const matches: MatchDef[] = [];

  for (const pairs of factors) {
    for (let i = 0; i < pairs.length; i += 2) {
      const [a1, a2] = pairs[i];
      const [b1, b2] = pairs[i + 1];
      matches.push({
        side1: [a1, a2],
        side2: [b1, b2],
      });
    }
  }

  return matches;
}

const SIX_PLAYER_PAIRINGS: [number, number, number, number][] = [
  [0, 1, 2, 3],
  [0, 2, 1, 3],
  [0, 3, 1, 2],
  [0, 4, 1, 5],
  [0, 5, 1, 4],
  [2, 4, 3, 5],
  [2, 5, 3, 4],
  [0, 1, 4, 5],
];

function buildSixPlayerMatchDefs(playerIds: string[]): MatchDef[] {
  return SIX_PLAYER_PAIRINGS.map(([a, b, c, d]) => ({
    side1: [playerIds[a], playerIds[b]],
    side2: [playerIds[c], playerIds[d]],
  }));
}

function buildScheduleGreedy(playerIds: string[]): MatchDef[] {
  const n = playerIds.length;
  const target = n - 1;
  const partnerships: [string, string][] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      partnerships.push([playerIds[i], playerIds[j]]);
    }
  }

  const partnershipKey = (a: string, b: string) => [a, b].sort().join('|');
  const playerGames = new Map(playerIds.map((id) => [id, 0]));
  const usedPairCount = new Map<string, number>();
  const matches: MatchDef[] = [];

  while (playerIds.some((id) => (playerGames.get(id) ?? 0) < target)) {
    let best: MatchDef | null = null;
    let bestScore = -Infinity;

    for (let i = 0; i < partnerships.length; i++) {
      for (let j = i + 1; j < partnerships.length; j++) {
        const p1 = partnerships[i];
        const p2 = partnerships[j];
        const players = new Set([p1[0], p1[1], p2[0], p2[1]]);
        if (players.size !== 4) continue;

        const involved = [...players];
        if (involved.some((id) => (playerGames.get(id) ?? 0) >= target)) {
          continue;
        }

        const k1 = partnershipKey(p1[0], p1[1]);
        const k2 = partnershipKey(p2[0], p2[1]);
        const used =
          (usedPairCount.get(k1) ?? 0) + (usedPairCount.get(k2) ?? 0);
        const urgency = involved.reduce(
          (sum, id) => sum + (target - (playerGames.get(id) ?? 0)),
          0,
        );
        const score = urgency * 10 - used * 100;

        if (score > bestScore) {
          bestScore = score;
          best = { side1: p1, side2: p2 };
        }
      }
    }

    if (!best) break;

    matches.push(best);
    [...best.side1, ...best.side2].forEach((id) =>
      playerGames.set(id, (playerGames.get(id) ?? 0) + 1),
    );

    const k1 = partnershipKey(best.side1[0], best.side1[1]);
    const k2 = partnershipKey(best.side2[0], best.side2[1]);
    usedPairCount.set(k1, (usedPairCount.get(k1) ?? 0) + 1);
    usedPairCount.set(k2, (usedPairCount.get(k2) ?? 0) + 1);
  }

  return matches;
}

const SIX_PLAYER_UNIQUE: [number, number, number, number][] = [
  [0, 1, 2, 3],
  [0, 2, 1, 3],
  [0, 3, 1, 2],
  [0, 4, 1, 5],
  [0, 5, 2, 4],
  [2, 5, 3, 4],
  [1, 4, 3, 5],
];

function buildSixPlayerUniqueMatchDefs(playerIds: string[]): MatchDef[] {
  return SIX_PLAYER_UNIQUE.map(([a, b, c, d]) => ({
    side1: [playerIds[a], playerIds[b]],
    side2: [playerIds[c], playerIds[d]],
  }));
}

function packPartnershipsGreedy(playerIds: string[]): MatchDef[] {
  const partnerships: [string, string][] = [];
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      partnerships.push([playerIds[i], playerIds[j]]);
    }
  }

  const used = new Set<string>();
  const matches: MatchDef[] = [];
  let found = true;

  while (found) {
    found = false;

    for (let i = 0; i < partnerships.length; i++) {
      const p1 = partnerships[i];
      const k1 = partnershipKey(p1[0], p1[1]);
      if (used.has(k1)) continue;

      for (let j = i + 1; j < partnerships.length; j++) {
        const p2 = partnerships[j];
        const k2 = partnershipKey(p2[0], p2[1]);
        if (used.has(k2)) continue;

        const players = new Set([p1[0], p1[1], p2[0], p2[1]]);
        if (players.size !== 4) continue;

        matches.push({ side1: p1, side2: p2 });
        used.add(k1);
        used.add(k2);
        found = true;
        break;
      }

      if (found) break;
    }
  }

  return matches;
}

/**
 * Gera partidas sem repetir parcerias (duplas) no mesmo grupo.
 */
export function generateUniquePartnershipMatches(
  playerIds: string[],
): MatchDef[] {
  const n = playerIds.length;
  if (n < 4) return [];

  if (n % 4 === 0) {
    return factorsToMatchDefs(oneFactorization(playerIds));
  }

  if (n === 6) {
    return buildSixPlayerUniqueMatchDefs(playerIds);
  }

  return packPartnershipsGreedy(playerIds);
}

/**
 * Duplas rotativas entre um grupo de jogadores (sem empacotar em rodadas).
 * Permite repetir parcerias quando necessário (ex.: 6 jogadores).
 */
export function generateRotatingPartnersMatchDefs(
  playerIds: string[],
): MatchDef[] {
  const n = playerIds.length;

  if (n % 4 === 0) {
    return factorsToMatchDefs(oneFactorization(playerIds));
  }

  if (n === 6) {
    return buildSixPlayerMatchDefs(playerIds);
  }

  return buildScheduleGreedy(playerIds);
}

/**
 * Individual: duplas rotativas — cada jogador joga uma vez com cada parceiro.
 */
export function generateIndividualSchedule(
  players: Player[],
  courtCount: number,
): Round[] {
  const playerIds = players.map((p) => p.id);
  const matchDefs = generateRotatingPartnersMatchDefs(playerIds);
  return packScheduleIntoRounds(matchDefs, courtCount);
}

export { packScheduleIntoRounds };

function collectTeamRoundRobinMatches(
  teamIds: string[],
  expandSides: (id: string) => string[],
): MatchDef[] {
  const participants = [...teamIds];
  const hasBye = participants.length % 2 !== 0;

  if (hasBye) {
    participants.push('__BYE__');
  }

  const total = participants.length;
  const roundsCount = total - 1;
  const matchesPerRound = total / 2;
  const rotated = [...participants];
  const matches: MatchDef[] = [];

  for (let r = 0; r < roundsCount; r++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const p1 = rotated[i];
      const p2 = rotated[total - 1 - i];

      if (p1 === '__BYE__' || p2 === '__BYE__') continue;

      matches.push({
        side1: expandSides(p1),
        side2: expandSides(p2),
      });
    }

    const fixed = rotated[0];
    const rest = rotated.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    rotated.length = 0;
    rotated.push(fixed, ...rest);
  }

  return matches;
}

/**
 * Dupla fixa: round robin entre duplas, distribuído em rodadas de `courtCount` jogos.
 */
export function generateDoublesSchedule(
  teams: Team[],
  courtCount: number,
): Round[] {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const teamIds = teams.map((t) => t.id);

  const matches = collectTeamRoundRobinMatches(teamIds, (teamId) => {
    const team = teamMap.get(teamId)!;
    return [team.player1Id, team.player2Id];
  });

  return packScheduleIntoRounds(matches, courtCount);
}

export function getTotalMatches(rounds: Round[]): number {
  return rounds.reduce((sum, round) => sum + round.matches.length, 0);
}

export function getFinishedMatches(rounds: Round[]): number {
  return rounds.reduce(
    (sum, round) =>
      sum + round.matches.filter((m) => m.status === 'finished').length,
    0,
  );
}

export function allMatchesFinished(rounds: Round[]): boolean {
  return rounds.every((round) =>
    round.matches.every((m) => m.status === 'finished'),
  );
}

export function getGamesPerPlayer(playerCount: number): number {
  return playerCount - 1;
}

export function getMatchesPerRound(
  playerCount: number,
  courtCount: number,
): number {
  const maxByPlayers = Math.floor(playerCount / 4);
  return Math.min(courtCount, maxByPlayers);
}
