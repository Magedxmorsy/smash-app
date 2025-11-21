import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Tournament,
  CreateTournamentForm,
  TournamentStatus,
  Team,
  Match,
} from '../types';
import { generateTournamentSchedule } from '../utils/tournamentUtils';

export const createTournament = async (
  formData: CreateTournamentForm,
  creatorId: string
): Promise<Tournament> => {
  try {
    const tournamentId = doc(collection(db, 'tournaments')).id;

    const tournament: Tournament = {
      id: tournamentId,
      ...formData,
      status: TournamentStatus.REGISTRATION_OPEN,
      creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'tournaments', tournamentId), {
      ...tournament,
      dateTime: Timestamp.fromDate(tournament.dateTime),
      createdAt: Timestamp.fromDate(tournament.createdAt),
      updatedAt: Timestamp.fromDate(tournament.updatedAt),
    });

    return tournament;
  } catch (error: any) {
    throw new Error(`Failed to create tournament: ${error.message}`);
  }
};

export const getTournament = async (
  tournamentId: string
): Promise<Tournament | null> => {
  try {
    const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));

    if (!tournamentDoc.exists()) {
      return null;
    }

    const data = tournamentDoc.data();
    return {
      ...data,
      dateTime: data.dateTime.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Tournament;
  } catch (error: any) {
    throw new Error(`Failed to get tournament: ${error.message}`);
  }
};

export const getUserTournaments = async (
  userId: string
): Promise<Tournament[]> => {
  try {
    // Get tournaments where user is creator
    const createdQuery = query(
      collection(db, 'tournaments'),
      where('creatorId', '==', userId),
      orderBy('dateTime', 'desc')
    );

    const createdSnapshot = await getDocs(createdQuery);
    const createdTournaments = createdSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        dateTime: data.dateTime.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Tournament;
    });

    // Get tournaments where user is a player
    const teamsQuery = query(
      collection(db, 'teams'),
      where('players', 'array-contains', { userId })
    );

    const teamsSnapshot = await getDocs(teamsQuery);
    const tournamentIds = new Set(
      teamsSnapshot.docs.map((doc) => doc.data().tournamentId)
    );

    const joinedTournaments: Tournament[] = [];
    for (const tournamentId of tournamentIds) {
      const tournament = await getTournament(tournamentId);
      if (tournament) {
        joinedTournaments.push(tournament);
      }
    }

    // Combine and deduplicate
    const allTournaments = [...createdTournaments, ...joinedTournaments];
    const uniqueTournaments = Array.from(
      new Map(allTournaments.map((t) => [t.id, t])).values()
    );

    return uniqueTournaments.sort(
      (a, b) => b.dateTime.getTime() - a.dateTime.getTime()
    );
  } catch (error: any) {
    throw new Error(`Failed to get user tournaments: ${error.message}`);
  }
};

export const updateTournamentStatus = async (
  tournamentId: string,
  status: TournamentStatus
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'tournaments', tournamentId), {
      status,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error: any) {
    throw new Error(`Failed to update tournament status: ${error.message}`);
  }
};

export const startTournament = async (tournamentId: string): Promise<void> => {
  try {
    const tournament = await getTournament(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Get all teams for the tournament
    const teamsQuery = query(
      collection(db, 'teams'),
      where('tournamentId', '==', tournamentId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    const teams = teamsSnapshot.docs.map((doc) => doc.data() as Team);

    if (teams.length !== tournament.numberOfTeams) {
      throw new Error('Not all team slots are filled');
    }

    // Generate tournament schedule (groups and matches)
    const { groups, matches } = generateTournamentSchedule(tournament, teams);

    // Save groups and matches
    for (const group of groups) {
      await setDoc(doc(db, 'groups', group.id), group);
    }

    for (const match of matches) {
      await setDoc(doc(db, 'matches', match.id), {
        ...match,
        dateTime: Timestamp.fromDate(match.dateTime),
        createdAt: Timestamp.fromDate(match.createdAt),
        updatedAt: Timestamp.fromDate(match.updatedAt),
      });
    }

    // Update tournament status
    await updateDoc(doc(db, 'tournaments', tournamentId), {
      status: TournamentStatus.GROUP_STAGE,
      groups: groups.map((g) => g.id),
      updatedAt: Timestamp.fromDate(new Date()),
    });

    // TODO: Send notifications to all players
  } catch (error: any) {
    throw new Error(`Failed to start tournament: ${error.message}`);
  }
};
