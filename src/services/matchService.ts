import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Match, MatchResult, MatchStatus, MatchResultForm } from '../types';
import { calculateMatchWinner, updateTeamStats } from '../utils/matchUtils';

export const getTournamentMatches = async (
  tournamentId: string
): Promise<Match[]> => {
  try {
    const matchesQuery = query(
      collection(db, 'matches'),
      where('tournamentId', '==', tournamentId),
      orderBy('dateTime', 'asc')
    );

    const matchesSnapshot = await getDocs(matchesQuery);

    return matchesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        dateTime: data.dateTime.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Match;
    });
  } catch (error: any) {
    throw new Error(`Failed to get tournament matches: ${error.message}`);
  }
};

export const getMatch = async (matchId: string): Promise<Match | null> => {
  try {
    const matchDoc = await getDoc(doc(db, 'matches', matchId));

    if (!matchDoc.exists()) {
      return null;
    }

    const data = matchDoc.data();
    return {
      ...data,
      dateTime: data.dateTime.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Match;
  } catch (error: any) {
    throw new Error(`Failed to get match: ${error.message}`);
  }
};

export const submitMatchResult = async (
  matchId: string,
  resultForm: MatchResultForm
): Promise<void> => {
  try {
    const match = await getMatch(matchId);

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.status === MatchStatus.COMPLETED) {
      throw new Error('Match already completed');
    }

    // Calculate winner and scores
    const result = calculateMatchWinner(resultForm.sets);

    // Update match with result
    await updateDoc(doc(db, 'matches', matchId), {
      result,
      status: MatchStatus.COMPLETED,
      updatedAt: Timestamp.fromDate(new Date()),
    });

    // Update team stats if it's a group stage match
    if (match.groupId) {
      await updateTeamStats(
        match.teamA.id,
        match.teamB.id,
        result,
        match.groupId
      );
    }

    // TODO: Send notifications to players
    // TODO: Check if round is complete and progress tournament
  } catch (error: any) {
    throw new Error(`Failed to submit match result: ${error.message}`);
  }
};

export const getUserUpcomingMatches = async (
  userId: string
): Promise<Match[]> => {
  try {
    // Get all user's teams
    const teamsQuery = query(
      collection(db, 'teams'),
      where('players', 'array-contains', { userId })
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    const userTeamIds = teamsSnapshot.docs.map((doc) => doc.id);

    if (userTeamIds.length === 0) {
      return [];
    }

    // Get matches where user's teams are playing and status is scheduled or in progress
    const now = Timestamp.fromDate(new Date());
    const matchesQuery = query(
      collection(db, 'matches'),
      where('status', 'in', [MatchStatus.SCHEDULED, MatchStatus.IN_PROGRESS]),
      where('dateTime', '>=', now),
      orderBy('dateTime', 'asc')
    );

    const matchesSnapshot = await getDocs(matchesQuery);

    // Filter matches where user's team is playing
    const userMatches = matchesSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          ...data,
          dateTime: data.dateTime.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Match;
      })
      .filter(
        (match) =>
          userTeamIds.includes(match.teamA.id) ||
          userTeamIds.includes(match.teamB.id)
      );

    return userMatches;
  } catch (error: any) {
    throw new Error(`Failed to get user upcoming matches: ${error.message}`);
  }
};

export const getUserRecentResults = async (
  userId: string
): Promise<Match[]> => {
  try {
    // Get all user's teams
    const teamsQuery = query(
      collection(db, 'teams'),
      where('players', 'array-contains', { userId })
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    const tournamentIds = new Set(
      teamsSnapshot.docs.map((doc) => doc.data().tournamentId)
    );

    if (tournamentIds.size === 0) {
      return [];
    }

    // Get recent completed matches from user's tournaments
    const allMatches: Match[] = [];

    for (const tournamentId of tournamentIds) {
      const matchesQuery = query(
        collection(db, 'matches'),
        where('tournamentId', '==', tournamentId),
        where('status', '==', MatchStatus.COMPLETED),
        orderBy('updatedAt', 'desc')
      );

      const matchesSnapshot = await getDocs(matchesQuery);

      const matches = matchesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          dateTime: data.dateTime.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Match;
      });

      allMatches.push(...matches);
    }

    // Sort by updated time and return top 10
    return allMatches
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10);
  } catch (error: any) {
    throw new Error(`Failed to get user recent results: ${error.message}`);
  }
};
