import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { SetResult, MatchResult, Team, TeamStats } from '../types';
import { POINTS_FOR_WIN, POINTS_FOR_DRAW, POINTS_FOR_LOSS } from '../constants';

export const calculateMatchWinner = (sets: SetResult[]): MatchResult => {
  let teamAScore = 0;
  let teamBScore = 0;
  let teamASetsWon = 0;
  let teamBSetsWon = 0;

  for (const set of sets) {
    teamAScore += set.teamA;
    teamBScore += set.teamB;

    if (set.teamA > set.teamB) {
      teamASetsWon++;
    } else if (set.teamB > set.teamA) {
      teamBSetsWon++;
    }
  }

  let winner: 'teamA' | 'teamB' | 'draw';

  if (teamASetsWon > teamBSetsWon) {
    winner = 'teamA';
  } else if (teamBSetsWon > teamASetsWon) {
    winner = 'teamB';
  } else {
    winner = 'draw';
  }

  return {
    winner,
    sets,
    teamAScore,
    teamBScore,
  };
};

export const updateTeamStats = async (
  teamAId: string,
  teamBId: string,
  result: MatchResult,
  groupId: string
): Promise<void> => {
  try {
    // Get current team stats
    const teamADoc = await getDoc(doc(db, 'teams', teamAId));
    const teamBDoc = await getDoc(doc(db, 'teams', teamBId));

    if (!teamADoc.exists() || !teamBDoc.exists()) {
      throw new Error('Team not found');
    }

    const teamA = teamADoc.data() as Team;
    const teamB = teamBDoc.data() as Team;

    const teamAStats: TeamStats = teamA.stats || {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    };

    const teamBStats: TeamStats = teamB.stats || {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    };

    // Update stats based on result
    teamAStats.played++;
    teamBStats.played++;

    teamAStats.goalsFor += result.teamAScore;
    teamAStats.goalsAgainst += result.teamBScore;
    teamBStats.goalsFor += result.teamBScore;
    teamBStats.goalsAgainst += result.teamAScore;

    if (result.winner === 'teamA') {
      teamAStats.won++;
      teamAStats.points += POINTS_FOR_WIN;
      teamBStats.lost++;
      teamBStats.points += POINTS_FOR_LOSS;
    } else if (result.winner === 'teamB') {
      teamBStats.won++;
      teamBStats.points += POINTS_FOR_WIN;
      teamAStats.lost++;
      teamAStats.points += POINTS_FOR_LOSS;
    } else {
      teamAStats.drawn++;
      teamAStats.points += POINTS_FOR_DRAW;
      teamBStats.drawn++;
      teamBStats.points += POINTS_FOR_DRAW;
    }

    teamAStats.goalDifference = teamAStats.goalsFor - teamAStats.goalsAgainst;
    teamBStats.goalDifference = teamBStats.goalsFor - teamBStats.goalsAgainst;

    // Update teams in Firestore
    await updateDoc(doc(db, 'teams', teamAId), { stats: teamAStats });
    await updateDoc(doc(db, 'teams', teamBId), { stats: teamBStats });
  } catch (error: any) {
    throw new Error(`Failed to update team stats: ${error.message}`);
  }
};

export const formatMatchTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const formatMatchDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  return date.toLocaleDateString('en-US', options);
};

export const isMatchStartable = (matchDate: Date): boolean => {
  const now = new Date();
  const timeDifference = matchDate.getTime() - now.getTime();
  const minutesDifference = timeDifference / (1000 * 60);

  // Allow starting match 15 minutes before scheduled time
  return minutesDifference <= 15;
};
