// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  stats: UserStats;
}

export interface UserStats {
  tournamentsPlayed: number;
  tournamentTrophies: number;
  matchesPlayed: number;
  matchesWon: number;
}

// Tournament Types
export enum TournamentStatus {
  REGISTRATION_OPEN = 'registration_open',
  GROUP_STAGE = 'group_stage',
  KNOCKOUT = 'knockout',
  COMPLETED = 'completed',
}

export enum TournamentFormat {
  WORLD_CUP = 'world_cup',
  SINGLE_ELIMINATION = 'single_elimination',
  ROUND_ROBIN = 'round_robin',
}

export interface Tournament {
  id: string;
  name: string;
  photoURL: string;
  location: string;
  dateTime: Date;
  format: TournamentFormat;
  numberOfTeams: number;
  rules: string;
  status: TournamentStatus;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  groups?: string[]; // Array of group IDs
  winners?: Winners;
}

export interface Winners {
  first: Team;
  second: Team;
  third: Team;
}

// Team Types
export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  players: Player[];
  groupId?: string;
  createdAt: Date;
  stats?: TeamStats;
}

export interface Player {
  userId: string;
  displayName: string;
  photoURL?: string;
}

export interface TeamStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  tournamentId: string;
  teams: Team[];
}

// Match Types
export enum MatchStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum MatchRound {
  GROUP_STAGE = 'group_stage',
  ROUND_OF_16 = 'round_of_16',
  QUARTER_FINALS = 'quarter_finals',
  SEMI_FINALS = 'semi_finals',
  THIRD_PLACE = 'third_place',
  FINAL = 'final',
}

export interface Match {
  id: string;
  tournamentId: string;
  round: MatchRound;
  groupId?: string;
  teamA: Team;
  teamB: Team;
  dateTime: Date;
  status: MatchStatus;
  result?: MatchResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchResult {
  winner: 'teamA' | 'teamB' | 'draw';
  sets: SetResult[];
  teamAScore: number;
  teamBScore: number;
}

export interface SetResult {
  teamA: number;
  teamB: number;
}

// Notification Types
export enum NotificationType {
  TOURNAMENT_INVITATION = 'tournament_invitation',
  TOURNAMENT_STARTING = 'tournament_starting',
  MATCH_REMINDER = 'match_reminder',
  MATCH_RESULT = 'match_result',
  TOURNAMENT_STATUS_CHANGE = 'tournament_status_change',
  NEW_TEAM_JOINED = 'new_team_joined',
  TOURNAMENT_COMPLETED = 'tournament_completed',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

// Form Types
export interface CreateTournamentForm {
  name: string;
  photoURL: string;
  location: string;
  dateTime: Date;
  format: TournamentFormat;
  numberOfTeams: number;
  rules: string;
}

export interface MatchResultForm {
  sets: SetResult[];
}
