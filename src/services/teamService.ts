import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Team, Player } from '../types';
import { TEAM_SIZE } from '../constants';

export const createTeam = async (
  tournamentId: string,
  player: Player
): Promise<Team> => {
  try {
    const teamId = doc(collection(db, 'teams')).id;

    // Get existing teams count for team naming
    const teamsQuery = query(
      collection(db, 'teams'),
      where('tournamentId', '==', tournamentId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    const teamNumber = teamsSnapshot.size + 1;

    const team: Team = {
      id: teamId,
      tournamentId,
      name: `Team ${teamNumber}`,
      players: [player],
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'teams', teamId), team);

    return team;
  } catch (error: any) {
    throw new Error(`Failed to create team: ${error.message}`);
  }
};

export const joinTeam = async (
  teamId: string,
  player: Player
): Promise<Team> => {
  try {
    const teamDocRef = doc(db, 'teams', teamId);
    const teamSnapshot = await getDoc(teamDocRef);

    if (!teamSnapshot.exists()) {
      throw new Error('Team not found');
    }

    const team = teamSnapshot.data() as Team;

    if (team.players.length >= TEAM_SIZE) {
      throw new Error('Team is full');
    }

    // Check if player is already in the team
    if (team.players.some((p) => p.userId === player.userId)) {
      throw new Error('Player already in team');
    }

    const updatedPlayers = [...team.players, player];

    await setDoc(
      doc(db, 'teams', teamId),
      {
        players: updatedPlayers,
      },
      { merge: true }
    );

    return {
      ...team,
      players: updatedPlayers,
    };
  } catch (error: any) {
    throw new Error(`Failed to join team: ${error.message}`);
  }
};

export const getTournamentTeams = async (
  tournamentId: string
): Promise<Team[]> => {
  try {
    const teamsQuery = query(
      collection(db, 'teams'),
      where('tournamentId', '==', tournamentId)
    );

    const teamsSnapshot = await getDocs(teamsQuery);

    return teamsSnapshot.docs.map((doc) => doc.data() as Team);
  } catch (error: any) {
    throw new Error(`Failed to get tournament teams: ${error.message}`);
  }
};

export const removePlayerFromTeam = async (
  teamId: string,
  userId: string
): Promise<void> => {
  try {
    const teamDocRef = doc(db, 'teams', teamId);
    const teamSnapshot = await getDoc(teamDocRef);

    if (!teamSnapshot.exists()) {
      throw new Error('Team not found');
    }

    const team = teamSnapshot.data() as Team;
    const updatedPlayers = team.players.filter((p) => p.userId !== userId);

    if (updatedPlayers.length === 0) {
      // If no players left, delete the team
      await deleteDoc(doc(db, 'teams', teamId));
    } else {
      await setDoc(
        doc(db, 'teams', teamId),
        {
          players: updatedPlayers,
        },
        { merge: true }
      );
    }
  } catch (error: any) {
    throw new Error(`Failed to remove player from team: ${error.message}`);
  }
};

export const isUserInTournament = async (
  tournamentId: string,
  userId: string
): Promise<boolean> => {
  try {
    const teams = await getTournamentTeams(tournamentId);
    return teams.some((team) =>
      team.players.some((player) => player.userId === userId)
    );
  } catch (error) {
    console.error('Error checking if user is in tournament:', error);
    return false;
  }
};
