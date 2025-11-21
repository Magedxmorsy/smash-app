import { TournamentFormat } from '../types';

// Tournament Constants
export const TEAM_SIZE = 2;

export const TEAM_COUNT_OPTIONS = [4, 8, 12, 16, 20, 24];

export const TOURNAMENT_FORMATS = [
  {
    value: TournamentFormat.WORLD_CUP,
    label: 'World Cup',
    enabled: true,
  },
  {
    value: TournamentFormat.SINGLE_ELIMINATION,
    label: 'Single Elimination',
    enabled: false,
    comingSoon: true,
  },
  {
    value: TournamentFormat.ROUND_ROBIN,
    label: 'Round Robin',
    enabled: false,
    comingSoon: true,
  },
];

// Points System
export const POINTS_FOR_WIN = 3;
export const POINTS_FOR_DRAW = 1;
export const POINTS_FOR_LOSS = 0;

// Match Scheduling
export const MATCH_REMINDER_MINUTES = 30;

// Status Colors
export const STATUS_COLORS = {
  registration_open: '#FDB813', // Yellow
  group_stage: '#1E90FF', // Blue
  knockout: '#9370DB', // Purple
  completed: '#808080', // Gray
};

// Status Labels
export const STATUS_LABELS = {
  registration_open: 'Registration Open',
  group_stage: 'Group Stage',
  knockout: 'Knockout',
  completed: 'Completed',
};

// Theme Colors
export const COLORS = {
  primary: '#1E90FF',
  secondary: '#FDB813',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
};

// World Cup Format Configuration
export const WORLD_CUP_CONFIG = {
  4: { groups: 2, teamsPerGroup: 2, knockoutRound: 'semi_finals' },
  8: { groups: 2, teamsPerGroup: 4, knockoutRound: 'semi_finals' },
  12: { groups: 4, teamsPerGroup: 3, knockoutRound: 'quarter_finals' },
  16: { groups: 4, teamsPerGroup: 4, knockoutRound: 'round_of_16' },
  20: { groups: 4, teamsPerGroup: 5, knockoutRound: 'round_of_16' },
  24: { groups: 4, teamsPerGroup: 6, knockoutRound: 'round_of_16' },
};
