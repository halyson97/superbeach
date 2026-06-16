import type {
  Championship,
  ClassificationCriteria,
  Match,
  Player,
  RankingEntry,
  Team,
} from '../types';

export function createInitialRanking(championship: Championship): RankingEntry[] {
  if (championship.gameType === 'fixed_double' && championship.teams) {
    return championship.teams.map((team) => ({
      playerId: team.id,
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

  return championship.players.map((player) => ({
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
    createInitialRanking(championship).map((entry) => [entry.playerId, entry]),
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
    if (championship.gameType === 'fixed_double' && championship.teams) {
      applyTeamMatchToRanking(
        rankingMap,
        match,
        championship.teams,
        championship.classificationCriteria,
      );
    } else {
      applyPlayerMatchToRanking(
        rankingMap,
        match,
        championship.classificationCriteria,
      );
    }
  }

  return sortRanking(
    Array.from(rankingMap.values()),
    championship.classificationCriteria,
  );
}

function updateRankingEntry(
  rankingMap: Map<string, RankingEntry>,
  participantId: string,
  won: boolean,
  gamesScored: number,
  gamesConceded: number,
  criteria: ClassificationCriteria,
): void {
  const entry = rankingMap.get(participantId);
  if (!entry) return;

  const gamesFor = entry.gamesFor + gamesScored;
  const gamesAgainst = entry.gamesAgainst + gamesConceded;

  rankingMap.set(participantId, {
    ...entry,
    gamesPlayed: entry.gamesPlayed + 1,
    wins: entry.wins + (won ? 1 : 0),
    losses: entry.losses + (won ? 0 : 1),
    gamesFor,
    gamesAgainst,
    balance: gamesFor - gamesAgainst,
    points:
      criteria === 'points' ? entry.points + gamesScored : entry.points,
  });
}

function applyPlayerMatchToRanking(
  rankingMap: Map<string, RankingEntry>,
  match: Match,
  criteria: ClassificationCriteria,
): void {
  const score1 = match.score1!;
  const score2 = match.score2!;
  const side1Won = score1 > score2;

  match.side1Ids.forEach((id) =>
    updateRankingEntry(rankingMap, id, side1Won, score1, score2, criteria),
  );
  match.side2Ids.forEach((id) =>
    updateRankingEntry(rankingMap, id, !side1Won, score2, score1, criteria),
  );
}

function getTeamIdFromSide(teams: Team[], playerIds: string[]): string | null {
  const team = teams.find(
    (t) => playerIds.includes(t.player1Id) && playerIds.includes(t.player2Id),
  );
  return team?.id ?? null;
}

function applyTeamMatchToRanking(
  rankingMap: Map<string, RankingEntry>,
  match: Match,
  teams: Team[],
  criteria: ClassificationCriteria,
): void {
  const score1 = match.score1!;
  const score2 = match.score2!;
  const side1Won = score1 > score2;

  const team1Id = getTeamIdFromSide(teams, match.side1Ids);
  const team2Id = getTeamIdFromSide(teams, match.side2Ids);

  if (!team1Id || !team2Id) return;

  updateRankingEntry(rankingMap, team1Id, side1Won, score1, score2, criteria);
  updateRankingEntry(rankingMap, team2Id, !side1Won, score2, score1, criteria);
}

export function getPlayerName(players: Player[], playerId: string): string {
  return players.find((p) => p.id === playerId)?.name ?? 'Desconhecido';
}

export function getRankingEntryName(
  championship: Championship,
  entry: RankingEntry,
): string {
  if (championship.gameType === 'fixed_double' && championship.teams) {
    const team = championship.teams.find((t) => t.id === entry.playerId);
    return team?.name ?? 'Dupla desconhecida';
  }

  return getPlayerName(championship.players, entry.playerId);
}

export function formatSideNames(
  playerIds: string[],
  players: Player[],
): string {
  return playerIds.map((id) => getPlayerName(players, id)).join(' / ');
}
