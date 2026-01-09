import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToCollection,
  createDocument,
  updateDocument,
  deleteDocument
} from '../services/firestoreService';
import { createNotification, createNotificationsForUsers } from '../services/notificationService';

const TournamentContext = createContext({});

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournaments must be used within a TournamentProvider');
  }
  return context;
};

/**
 * Helper: Get all participant user IDs from a tournament
 */
const getTournamentParticipantIds = (tournament) => {
  const ids = new Set();
  tournament.teams?.forEach(team => {
    if (team.player1?.userId) ids.add(team.player1.userId);
    if (team.player2?.userId) ids.add(team.player2.userId);
  });
  return Array.from(ids);
};

export const TournamentProvider = ({ children }) => {
  const { userData } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Subscribe to tournaments from Firestore
  useEffect(() => {
    if (!userData?.uid) {
      setTournaments([]);
      setIsLoaded(true);
      return;
    }

    // Subscribe to all tournaments (we'll filter client-side for now)
    const unsubscribe = subscribeToCollection(
      'tournaments',
      [
        { type: 'orderBy', field: 'createdAt', direction: 'desc' }
      ],
      (firestoreTournaments) => {
        setTournaments(firestoreTournaments);
        setIsLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [userData?.uid]);

  /**
   * Create a new tournament
   * Notification: Tournament Created (sent to host)
   */
  const createTournament = async (tournamentData) => {
    const newTournament = {
      ...tournamentData,
      hostId: userData?.uid,
      hostName: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown',
      status: 'REGISTRATION',
      registeredTeams: tournamentData.joinAsPlayer ? 1 : 0,
      participantIds: tournamentData.joinAsPlayer ? [userData?.uid] : [],
      teams: tournamentData.joinAsPlayer ? [
        {
          player1: {
            firstName: userData?.firstName || 'Host',
            lastName: userData?.lastName || 'Player',
            avatarUri: userData?.avatarUri || null,
            userId: userData?.uid,
          },
          player2: null,
          isAdminTeam: true,
        }
      ] : [],
    };

    const { id, error } = await createDocument('tournaments', newTournament);

    if (error) {
      console.error('Error creating tournament:', error);
      return null;
    }

    // No notification for tournament creation (removed per requirements)

    return { ...newTournament, id };
  };

  /**
   * Update a tournament
   * Notification: Tournament Updated (sent to all participants if significant change)
   */
  const updateTournament = async (tournamentId, updates) => {
    const tournament = getTournamentById(tournamentId);
    if (!tournament) return;

    const { error } = await updateDocument('tournaments', tournamentId, updates);

    if (error) {
      console.error('Error updating tournament:', error);
      return;
    }

    // Check if it's a significant change
    const significantChange =
      (updates.dateTime && updates.dateTime !== tournament.dateTime) ||
      (updates.location && updates.location !== tournament.location) ||
      (updates.rules && updates.rules !== tournament.rules);

    if (significantChange) {
      const participantIds = getTournamentParticipantIds(tournament);

      // Notification 4: Tournament Updated
      await createNotificationsForUsers(participantIds, {
        type: 'tournament',
        action: 'tournament_updated',
        title: 'Tournament Updated',
        message: `${tournament.name} details have changed`,
        metadata: { tournamentId, tournamentName: tournament.name }
      });
    }
  };

  /**
   * Delete a tournament
   * Notification: Tournament Cancelled (sent to all participants)
   */
  const deleteTournament = async (tournamentId) => {
    const tournament = getTournamentById(tournamentId);
    if (!tournament) return;

    const participantIds = getTournamentParticipantIds(tournament);

    // Notification 5: Tournament Cancelled
    await createNotificationsForUsers(participantIds, {
      type: 'tournament',
      action: 'tournament_cancelled',
      title: 'Tournament Cancelled',
      message: `${tournament.name} has been cancelled`,
      metadata: { tournamentId, tournamentName: tournament.name }
    });

    const { error } = await deleteDocument('tournaments', tournamentId);

    if (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  /**
   * Start a tournament
   * Notification: Tournament Started (sent to all participants)
   */
  const startTournament = async (tournamentId) => {
    const tournament = getTournamentById(tournamentId);
    if (!tournament) return;

    const participantIds = getTournamentParticipantIds(tournament);

    // Update tournament status
    await updateDocument('tournaments', tournamentId, { status: 'GROUP STAGE' });

    // Notification 3: Tournament Started
    await createNotificationsForUsers(participantIds, {
      type: 'tournament',
      action: 'tournament_started',
      title: 'Tournament Started',
      message: `${tournament.name} has started! Check your matches.`,
      metadata: { tournamentId, tournamentName: tournament.name }
    });
  };

  /**
   * Join a tournament as a team (creates team or joins existing)
   * Notifications:
   * - Team Created (if creating new team)
   * - You Joined Team (to player2 when joining existing team)
   * - Teammate Joined (to player1 when player2 joins)
   * - New Team Joined (to other participants)
   * - Team Completed (to all participants when team fills)
   * - Tournament Full (to host when tournament fills)
   */
  const joinTournamentTeam = async (tournamentId, teamIndex, isCreating) => {
    const tournament = getTournamentById(tournamentId);
    if (!tournament) return;

    const teams = tournament.teams || [];
    let updatedTeams;
    let participantIds = tournament.participantIds || [];

    if (isCreating) {
      // Creating a new team
      const newTeam = {
        player1: {
          firstName: userData?.firstName || 'Player',
          lastName: userData?.lastName || '',
          avatarUri: userData?.avatarUri || null,
          userId: userData?.uid,
        },
        player2: null,
        isAdminTeam: false,
      };

      updatedTeams = [...teams, newTeam];
      participantIds = [...participantIds, userData.uid];

      // No notification for team creation (removed per requirements)

      // Notification: New Team Joined (updated message to include player name)
      const otherParticipants = participantIds.filter(id => id !== userData.uid);
      await createNotificationsForUsers(otherParticipants, {
        type: 'team',
        action: 'new_team_joined',
        title: 'New Team Joined',
        message: `${userData.firstName} ${userData.lastName} created a new team in ${tournament.name}`,
        metadata: { tournamentId, tournamentName: tournament.name },
        playerInfo: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatarUri: userData.avatarUri,
        }
      });

    } else {
      // Joining an existing team as player2
      const selectedTeam = teams[teamIndex];
      if (!selectedTeam || selectedTeam.player2) return; // Team already full

      updatedTeams = teams.map((team, idx) =>
        idx === teamIndex
          ? {
              ...team,
              player2: {
                firstName: userData?.firstName || 'Player',
                lastName: userData?.lastName || '',
                avatarUri: userData?.avatarUri || null,
                userId: userData?.uid,
              }
            }
          : team
      );

      participantIds = [...participantIds, userData.uid];

      // Notification: Teammate Joined (to player1) - kept per requirements
      await createNotification(selectedTeam.player1.userId, {
        type: 'team',
        action: 'teammate_joined',
        title: 'Teammate Joined',
        message: `${userData.firstName} ${userData.lastName} joined your team in tournament: ${tournament.name}`,
        metadata: { tournamentId, tournamentName: tournament.name },
        playerInfo: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatarUri: userData.avatarUri,
        }
      });

      // Notifications "you_joined_team" and "team_completed" removed per requirements
    }

    const registeredTeams = updatedTeams.filter(t => t.player1 && t.player2).length;

    await updateDocument('tournaments', tournamentId, {
      teams: updatedTeams,
      registeredTeams,
      participantIds
    });

    // Notification 2: Tournament Full (to host)
    if (registeredTeams === tournament.teamCount) {
      await createNotification(tournament.hostId, {
        type: 'tournament',
        action: 'tournament_full',
        title: 'Tournament Full',
        message: `${tournament.name} is full! Ready to start.`,
        metadata: { tournamentId, tournamentName: tournament.name }
      });
    }
  };

  /**
   * Remove a player from a team
   * - If the player is alone on the team, deletes the entire team
   * - If the team has 2 players, sets the player position to null
   * - Recalculates registeredTeams count
   */
  const removePlayerFromTeam = async (tournamentId, teamIndex, playerPosition) => {
    try {
      const tournament = getTournamentById(tournamentId);
      if (!tournament) {
        return { success: false, error: 'Tournament not found' };
      }

      const teams = tournament.teams || [];
      const team = teams[teamIndex];

      if (!team || !team[playerPosition]) {
        return { success: false, error: 'Player not found' };
      }

      // Check if this is the only player on the team
      const otherPosition = playerPosition === 'player1' ? 'player2' : 'player1';
      const isOnlyPlayer = !team[otherPosition];

      let updatedTeams;

      if (isOnlyPlayer) {
        // Delete the entire team if the player is alone
        updatedTeams = teams.filter((t, idx) => idx !== teamIndex);
      } else {
        // Just remove the player, keep the team with the other player
        updatedTeams = teams.map((t, idx) =>
          idx === teamIndex
            ? {
                ...t,
                [playerPosition]: null
              }
            : t
        );
      }

      // Recalculate registeredTeams (only count complete teams)
      const registeredTeams = updatedTeams.filter(
        team => team.player1 && team.player2
      ).length;

      // Update tournament in Firestore
      await updateDocument('tournaments', tournamentId, {
        teams: updatedTeams,
        registeredTeams
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing player:', error);
      return { success: false, error: error.message };
    }
  };

  const getTournamentById = (tournamentId) => {
    return tournaments.find((t) => t.id === tournamentId);
  };

  const getHostedTournaments = () => {
    if (!userData) return [];
    return tournaments.filter((t) => t.hostId === userData.uid);
  };

  const getJoinedTournaments = () => {
    if (!userData) return [];
    return tournaments.filter((t) => {
      if (t.hostId === userData.uid) return false;
      return t.participantIds?.includes(userData.uid);
    });
  };

  const getOngoingTournaments = () => {
    return tournaments.filter((t) =>
      t.status === 'REGISTRATION' ||
      t.status === 'GROUP STAGE' ||
      t.status === 'SEMI FINALS' ||
      t.status === 'FINALS'
    );
  };

  const getCompletedTournaments = () => {
    return tournaments.filter((t) => t.status === 'FINISHED');
  };

  const value = {
    tournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    startTournament,
    joinTournamentTeam,
    removePlayerFromTeam,
    getTournamentById,
    getHostedTournaments,
    getJoinedTournaments,
    getOngoingTournaments,
    getCompletedTournaments,
    isLoaded,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};
