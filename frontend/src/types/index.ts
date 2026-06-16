export type GameType = 'individual' | 'fixed_double' | 'mix';
export type ClassificationCriteria = 'wins' | 'points';
export type MatchStatus = 'not_started' | 'in_progress' | 'finished';
export type ChampionshipStatus = 'active' | 'finished';
export type PlayerGender = 'male' | 'female';
export type MatchCategory = 'men' | 'women' | 'mixed';

export interface Player {
  id: string;
  name: string;
  gender?: PlayerGender;
}

export interface Team {
  id: string;
  player1Id: string;
  player2Id: string;
  name: string;
}

export interface Match {
  id: string;
  roundNumber: number;
  court: number;
  status: MatchStatus;
  side1Ids: string[];
  side2Ids: string[];
  score1?: number;
  score2?: number;
  category?: MatchCategory;
}

export interface Round {
  number: number;
  matches: Match[];
}

export interface RankingEntry {
  playerId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  gamesFor: number;
  gamesAgainst: number;
  balance: number;
  points: number;
  tiebreaker: number;
}

export interface Championship {
  id: string;
  name: string;
  createdAt: string;
  gameType: GameType;
  playerCount: number;
  courtCount: number;
  classificationCriteria: ClassificationCriteria;
  players: Player[];
  teams?: Team[];
  rounds: Round[];
  ranking: RankingEntry[];
  status: ChampionshipStatus;
  finishedAt?: string;
  shareToken?: string;
}

export interface NewGameFormData {
  gameType: GameType;
  playerCount: number;
  courtCount: number;
  classificationCriteria: ClassificationCriteria;
  randomizePlayers: boolean;
  playerNames: string[];
  playerGenders?: PlayerGender[];
  pairs?: [string, string][];
}
