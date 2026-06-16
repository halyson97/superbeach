import type {
  Championship,
  ClassificationCriteria,
  Match,
  Player,
  RankingEntry,
} from '../types';

export function createInitialRanking(players: Player[]): RankingEntry[] {
  return players.map((player) => ({
    playerId: player.id,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    gamesFor: 0,
    gamesAgainst: 0,
    balance: 0,
    points: 0,
    tiebreaker: Math.random(),
  }));
}

function compareEntries(
  a: RankingEntry,
  b: RankingEntry,
  criteria: ClassificationCriteria,
): number {
  if (criteria === 'points') {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.balance !== a.balance) return b.balance - a.balance;
    return b.tiebreaker - a.tiebreaker;
  }

  if (b.wins !== a.wins) return b.wins - a.wins;
  if (b.balance !== a.balance) return b.balance - a.balance;
  if (b.gamesFor !== a.gamesFor) return b.gamesFor - a.gamesFor;
  return b.tiebreaker - a.tiebreaker;
}

export function sortRanking(
  ranking: RankingEntry[],
  criteria: ClassificationCriteria,
): RankingEntry[] {
  return [...ranking].sort((a, b) => compareEntries(a, b, criteria));
}

export function recalculateRanking(championship: Championship): RankingEntry[] {
  const rankingMap = new Map(
    createInitialRanking(championship.players).map((entry) => [
      entry.playerId,
      entry,
    ]),
  );

  const finishedMatches = championship.rounds.flatMap((round) =>
    round.matches.filter(
      (match) =>
        match.status === 'finished' &&
        match.score1 !== undefined &&
        match.score2 !== undefined,
    ),
  );

  for (const match of finishedMatches) {
    applyMatchToRanking(rankingMap, match, championship.classificationCriteria);
  }

  return sortRanking(
    Array.from(rankingMap.values()),
    championship.classificationCriteria,
  );
}

function applyMatchToRanking(
  rankingMap: Map<string, RankingEntry>,
  match: Match,
  criteria: ClassificationCriteria,
): void {
  const score1 = match.score1!;
  const score2 = match.score2!;
  const side1Won = score1 > score2;

  const updatePlayer = (
    playerId: string,
    won: boolean,
    gamesScored: number,
    gamesConceded: number,
  ) => {
    const entry = rankingMap.get(playerId);
    if (!entry) return;

    const gamesFor = entry.gamesFor + gamesScored;
    const gamesAgainst = entry.gamesAgainst + gamesConceded;

    rankingMap.set(playerId, {
      ...entry,
      gamesPlayed: entry.gamesPlayed + 1,
      wins: entry.wins + (won ? 1 : 0),
      losses: entry.losses + (won ? 0 : 1),
      gamesFor,
      gamesAgainst,
      balance: gamesFor - gamesAgainst,
      points:
        criteria === 'points'
          ? entry.points + gamesScored
          : entry.points,
    });
  };

  match.side1Ids.forEach((id) =>
    updatePlayer(id, side1Won, score1, score2),
  );
  match.side2Ids.forEach((id) =>
    updatePlayer(id, !side1Won, score2, score1),
  );
}

export function getPlayerName(
  players: Player[],
  playerId: string,
): string {
  return players.find((p) => p.id === playerId)?.name ?? 'Desconhecido';
}

export function formatSideNames(
  playerIds: string[],
  players: Player[],
): string {
  return playerIds.map((id) => getPlayerName(players, id)).join(' / ');
}
