import {
  Tournament,
  Team,
  Group,
  Match,
  MatchStatus,
  MatchRound,
} from '../types';
import { WORLD_CUP_CONFIG } from '../constants';

export const generateTournamentSchedule = (
  tournament: Tournament,
  teams: Team[]
): { groups: Group[]; matches: Match[] } => {
  const config = WORLD_CUP_CONFIG[tournament.numberOfTeams as keyof typeof WORLD_CUP_CONFIG];

  if (!config) {
    throw new Error('Invalid number of teams');
  }

  // Shuffle teams randomly
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

  // Create groups
  const groups: Group[] = [];
  for (let i = 0; i < config.groups; i++) {
    const groupTeams = shuffledTeams.slice(
      i * config.teamsPerGroup,
      (i + 1) * config.teamsPerGroup
    );

    groups.push({
      id: `group-${i + 1}`,
      name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C, D
      tournamentId: tournament.id,
      teams: groupTeams.map((team) => ({
        ...team,
        groupId: `group-${i + 1}`,
        stats: {
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
        },
      })),
    });
  }

  // Generate group stage matches
  const matches: Match[] = [];
  let matchCounter = 0;

  for (const group of groups) {
    const groupMatches = generateRoundRobinMatches(
      group.teams,
      tournament,
      group.id
    );
    matches.push(...groupMatches);
    matchCounter += groupMatches.length;
  }

  // Calculate match times with auto-stagger
  const totalMatches = calculateTotalMatches(tournament.numberOfTeams, config);
  const staggeredMatches = staggerMatchTimes(
    matches,
    tournament.dateTime,
    totalMatches
  );

  return { groups, matches: staggeredMatches };
};

const generateRoundRobinMatches = (
  teams: Team[],
  tournament: Tournament,
  groupId: string
): Match[] => {
  const matches: Match[] = [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: `match-${Date.now()}-${i}-${j}`,
        tournamentId: tournament.id,
        round: MatchRound.GROUP_STAGE,
        groupId,
        teamA: teams[i],
        teamB: teams[j],
        dateTime: tournament.dateTime, // Will be adjusted by staggerMatchTimes
        status: MatchStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return matches;
};

const calculateTotalMatches = (
  numberOfTeams: number,
  config: any
): number => {
  // Group stage matches
  const matchesPerGroup = (config.teamsPerGroup * (config.teamsPerGroup - 1)) / 2;
  const groupStageMatches = matchesPerGroup * config.groups;

  // Knockout matches
  let knockoutMatches = 0;
  switch (config.knockoutRound) {
    case 'round_of_16':
      knockoutMatches = 8 + 4 + 2 + 1 + 1; // R16 + QF + SF + 3rd place + Final
      break;
    case 'quarter_finals':
      knockoutMatches = 4 + 2 + 1 + 1; // QF + SF + 3rd place + Final
      break;
    case 'semi_finals':
      knockoutMatches = 2 + 1 + 1; // SF + 3rd place + Final
      break;
  }

  return groupStageMatches + knockoutMatches;
};

const staggerMatchTimes = (
  matches: Match[],
  startTime: Date,
  totalMatches: number
): Match[] => {
  // Assume 8 hours of play per day
  const hoursAvailable = 8;
  const minutesAvailable = hoursAvailable * 60;
  const minutesPerMatch = Math.floor(minutesAvailable / totalMatches);

  // Ensure at least 30 minutes per match
  const effectiveMinutesPerMatch = Math.max(30, minutesPerMatch);

  return matches.map((match, index) => ({
    ...match,
    dateTime: new Date(
      startTime.getTime() + index * effectiveMinutesPerMatch * 60 * 1000
    ),
  }));
};

export const getGroupStandings = (group: Group, matches: Match[]): Team[] => {
  // Calculate standings based on match results
  const standings = [...group.teams];

  // Sort by points, then goal difference, then goals for
  standings.sort((a, b) => {
    if (!a.stats || !b.stats) return 0;

    if (b.stats.points !== a.stats.points) {
      return b.stats.points - a.stats.points;
    }

    if (b.stats.goalDifference !== a.stats.goalDifference) {
      return b.stats.goalDifference - a.stats.goalDifference;
    }

    return b.stats.goalsFor - a.stats.goalsFor;
  });

  return standings;
};

export const determineKnockoutQualifiers = (
  groups: Group[],
  matches: Match[]
): Team[] => {
  const qualifiers: Team[] = [];

  for (const group of groups) {
    const standings = getGroupStandings(group, matches);
    // Top 2 teams from each group qualify
    qualifiers.push(...standings.slice(0, 2));
  }

  return qualifiers;
};

export const generateKnockoutMatches = (
  tournament: Tournament,
  qualifiers: Team[],
  round: MatchRound,
  startTime: Date
): Match[] => {
  const matches: Match[] = [];

  // Pair teams for knockout matches
  for (let i = 0; i < qualifiers.length; i += 2) {
    if (i + 1 < qualifiers.length) {
      matches.push({
        id: `match-${Date.now()}-${round}-${i}`,
        tournamentId: tournament.id,
        round,
        teamA: qualifiers[i],
        teamB: qualifiers[i + 1],
        dateTime: startTime,
        status: MatchStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return staggerMatchTimes(matches, startTime, matches.length);
};
