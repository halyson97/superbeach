import type { Match, Player, Round, Team } from '../types';
import { generateId } from './id';

type MatchDef = {
  side1: string[];
  side2: string[];
};

function createMatch(
  side1Ids: string[],
  side2Ids: string[],
  roundNumber: number,
  court: number,
): Match {
  return {
    id: generateId(),
    roundNumber,
    court,
    status: 'not_started',
    side1Ids,
    side2Ids,
  };
}

/**
 * Agrupa partidas em rodadas com exatamente `courtCount` jogos cada.
 * Cada quadra recebe uma partida (4 jogadores = duas duplas).
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
    const roundMatches: Match[] = [];
    const usedIndices: number[] = [];
    const busyPlayers = new Set<string>();

    for (
      let i = 0;
      i < remaining.length && roundMatches.length < courtCount;
      i++
    ) {
      const game = remaining[i];
      const players = [...game.side1, ...game.side2];

      if (players.some((id) => busyPlayers.has(id))) continue;

      roundMatches.push(
        createMatch(
          game.side1,
          game.side2,
          roundNumber,
          roundMatches.length + 1,
        ),
      );
      players.forEach((id) => busyPlayers.add(id));
      usedIndices.push(i);
    }

    for (let i = usedIndices.length - 1; i >= 0; i--) {
      remaining.splice(usedIndices[i], 1);
    }

    if (roundMatches.length === 0) {
      const game = remaining.shift()!;
      roundMatches.push(createMatch(game.side1, game.side2, roundNumber, 1));
    }

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

/**
 * Individual: duplas rotativas — cada jogador joga uma vez com cada parceiro.
 */
export function generateIndividualSchedule(
  players: Player[],
  courtCount: number,
): Round[] {
  const playerIds = players.map((p) => p.id);
  const n = playerIds.length;

  let matchDefs: MatchDef[];

  if (n % 4 === 0) {
    matchDefs = factorsToMatchDefs(oneFactorization(playerIds));
  } else if (n === 6) {
    matchDefs = buildSixPlayerMatchDefs(playerIds);
  } else {
    matchDefs = buildScheduleGreedy(playerIds);
  }

  return packScheduleIntoRounds(matchDefs, courtCount);
}

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
