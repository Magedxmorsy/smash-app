import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToCollection,
  createDocument,
  updateDocument,
  deleteDocument
} from '../services/firestoreService';
import { createNotification, createNotificationsForUsers } from '../services/notificationService';
import { scheduleMatches, parseCourts, calculateRoundDuration } from '../utils/courtScheduler';

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

/**
 * Helper: Check if all group stage matches are complete
 */
const areAllGroupMatchesComplete = (tournament) => {
  if (!tournament.matches || tournament.matches.length === 0) return false;
  const groupMatches = tournament.matches.filter(match => match.groupId);
  if (groupMatches.length === 0) return false;
  return groupMatches.every(match => match.scoreRecorded);
};

/**
 * Helper: Check if all knockout matches are complete
 */
const areAllKnockoutMatchesComplete = (tournament) => {
  if (!tournament.matches || tournament.matches.length === 0) return false;
  const knockoutMatches = tournament.matches.filter(match =>
    match.round === 'semifinal' || match.round === 'knockout'
  );
  if (knockoutMatches.length === 0) return false;
  return knockoutMatches.every(match => match.scoreRecorded);
};

/**
 * Helper: Calculate standings for a group
 */
const calculateStandings = (tournament, groupId) => {
  if (!tournament || !tournament.matches || !tournament.groups) {
    return [];
  }

  const group = tournament.groups.find(g => g.id === groupId);
  if (!group) return [];

  const groupTeams = group.teams || [];
  const standings = groupTeams.map(team => ({
    team,
    played: 0,
    won: 0,
    lost: 0,
    points: 0,
  }));

  const groupMatches = tournament.matches.filter(
    match => match.groupId === groupId && match.scoreRecorded
  );

  const teamsMatch = (team1, team2) => {
    if (team1.player1.userId && team2.player1.userId) {
      return (
        team1.player1.userId === team2.player1.userId &&
        team1.player2.userId === team2.player2.userId
      );
    }
    return (
      team1.player1.firstName === team2.player1.firstName &&
      team1.player1.lastName === team2.player1.lastName &&
      team1.player2.firstName === team2.player2.firstName &&
      team1.player2.lastName === team2.player2.lastName
    );
  };

  groupMatches.forEach(match => {
    const team1Index = standings.findIndex(s => teamsMatch(s.team, match.team1));
    const team2Index = standings.findIndex(s => teamsMatch(s.team, match.team2));

    if (team1Index !== -1 && team2Index !== -1) {
      standings[team1Index].played++;
      standings[team2Index].played++;

      if (match.winningTeam === 'left') {
        standings[team1Index].won++;
        standings[team1Index].points += 3;
        standings[team2Index].lost++;
      } else if (match.winningTeam === 'right') {
        standings[team2Index].won++;
        standings[team2Index].points += 3;
        standings[team1Index].lost++;
      }
    }
  });

  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.won !== a.won) return b.won - a.won;
    return b.played - a.played;
  });
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

  // One-time migration: Fix COMPLETED → FINISHED
  useEffect(() => {
    if (!isLoaded || tournaments.length === 0) return;

    const tournamentsToMigrate = tournaments.filter(t => t.status === 'COMPLETED');
    if (tournamentsToMigrate.length > 0) {
      console.log(`🔄 Auto-migrating ${tournamentsToMigrate.length} tournaments from COMPLETED to FINISHED`);

      tournamentsToMigrate.forEach(async (tournament) => {
        const finalMatch = tournament.matches?.find(m => m.round === 'final');
        const winnerTeam = finalMatch?.winningTeam === 'left' ? finalMatch?.team1 : finalMatch?.team2;

        await updateDocument('tournaments', tournament.id, {
          status: 'FINISHED',
          ...(winnerTeam && { winner: winnerTeam })
        });
        console.log(`✅ Migrated: ${tournament.name}`);
      });
    }
  }, [isLoaded, tournaments.length]);

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
      registeredTeams: 0, // Always 0 initially - only complete teams (player1 + player2) count
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
   * Reschedule tournament matches based on new date/time/courts/location
   * Preserves groups, teams, and match scores while regenerating scheduling
   */
  const rescheduleMatches = (tournament, newDateTime, newCourts, newLocation) => {
    const matches = tournament.matches;
    const courtNames = parseCourts(newCourts || '1');
    const baseDateTime = new Date(newDateTime);

    console.log('🔄 Rescheduling matches:', {
      matchCount: matches.length,
      newDateTime,
      newCourts,
      courtNames,
      newLocation
    });

    // Group matches by round
    const matchesByRound = {};
    matches.forEach(match => {
      const round = match.round;
      if (!matchesByRound[round]) matchesByRound[round] = [];

      // Strip scheduling fields - keep only match pairings and metadata
      const cleanMatch = {
        id: match.id,
        round: match.round,
        groupId: match.groupId,
        groupName: match.groupName,
        team1: match.team1,
        team2: match.team2,
        status: match.status,
        score: match.score,
        tournamentName: match.tournamentName,
        location: newLocation, // Update location
      };

      matchesByRound[round].push(cleanMatch);
    });

    // Reschedule each round with cumulative offset (FIX)
    const rescheduledMatches = [];
    let cumulativeOffset = 0; // Track total time used by previous rounds

    Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b)).forEach(roundNumber => {
      const roundMatches = matchesByRound[roundNumber];
      const roundStartTime = new Date(baseDateTime.getTime() + cumulativeOffset * 60000);

      console.log(`📅 Scheduling Round ${roundNumber}:`, {
        roundStartTime: roundStartTime.toISOString(),
        matchesInRound: roundMatches.length,
        cumulativeOffset
      });

      const scheduledRound = scheduleMatches(
        roundMatches,
        courtNames,
        roundStartTime,
        30,  // match duration in minutes
        15   // buffer time in minutes
      );

      // Calculate actual duration of this round and add to cumulative offset
      // This prevents court conflicts when there are fewer courts than matches
      cumulativeOffset += calculateRoundDuration(
        roundMatches.length,
        courtNames.length,
        30,
        15
      );

      rescheduledMatches.push(...scheduledRound);
    });

    console.log('✅ Rescheduled', rescheduledMatches.length, 'matches');
    return rescheduledMatches;
  };

  /**
   * Create knockout stage matches from group standings
   */
  const createKnockoutMatches = (tournament) => {
    if (!tournament.groups || tournament.groups.length !== 2) {
      console.error('❌ Cannot create knockout matches: Invalid groups', {
        hasGroups: !!tournament.groups,
        groupCount: tournament.groups?.length
      });
      return [];
    }

    const groupStandings = tournament.groups.map(group => ({
      groupName: group.name,
      standings: calculateStandings(tournament, group.id)
    }));

    const groupA = groupStandings[0];
    const groupB = groupStandings[1];

    console.log('📊 Group Standings:', {
      groupA: {
        name: groupA.groupName,
        first: groupA.standings[0]?.team,
        second: groupA.standings[1]?.team
      },
      groupB: {
        name: groupB.groupName,
        first: groupB.standings[0]?.team,
        second: groupB.standings[1]?.team
      }
    });

    // Get available courts
    const availableCourts = tournament.courts ? parseCourts(tournament.courts) : [];
    const getRandomCourt = () => availableCourts.length > 0
      ? availableCourts[Math.floor(Math.random() * availableCourts.length)]
      : 'TBD';

    const knockoutMatches = [
      {
        id: `knockout-sf1-${tournament.id}`,
        round: 'semifinal',
        team1: groupA.standings[0]?.team,
        team2: groupB.standings[1]?.team,
        tournamentName: tournament.name,
        tournamentId: tournament.id,
        location: tournament.location,
        court: getRandomCourt(),
        dateTime: tournament.dateTime,
        status: 'Semifinal 1',
        scoreRecorded: false,
        score: null,
        winningTeam: null,
      },
      {
        id: `knockout-sf2-${tournament.id}`,
        round: 'semifinal',
        team1: groupB.standings[0]?.team,
        team2: groupA.standings[1]?.team,
        tournamentName: tournament.name,
        tournamentId: tournament.id,
        location: tournament.location,
        court: getRandomCourt(),
        dateTime: tournament.dateTime,
        status: 'Semifinal 2',
        scoreRecorded: false,
        score: null,
        winningTeam: null,
      }
    ];

    console.log('✅ Created knockout matches:', knockoutMatches);

    return knockoutMatches;
  };

  /**
   * Create final match
   */
  const createFinalMatch = (tournament) => {
    const semifinalMatches = tournament.matches.filter(m => m.round === 'semifinal');
    if (semifinalMatches.length !== 2) return null;

    const sf1Winner = semifinalMatches[0].winningTeam === 'left'
      ? semifinalMatches[0].team1
      : semifinalMatches[0].team2;

    const sf2Winner = semifinalMatches[1].winningTeam === 'left'
      ? semifinalMatches[1].team1
      : semifinalMatches[1].team2;

    // Get available courts
    const availableCourts = tournament.courts ? parseCourts(tournament.courts) : [];
    const randomCourt = availableCourts.length > 0
      ? availableCourts[Math.floor(Math.random() * availableCourts.length)]
      : 'TBD';

    return {
      id: `knockout-final-${tournament.id}`,
      round: 'final',
      team1: sf1Winner,
      team2: sf2Winner,
      tournamentName: tournament.name,
      tournamentId: tournament.id,
      location: tournament.location,
      court: randomCourt,
      dateTime: tournament.dateTime,
      status: 'Final',
      scoreRecorded: false,
      score: null,
      winningTeam: null,
    };
  };

  /**
   * Check and progress tournament status if needed
   */
  const createPlaceholderFinal = (tournament) => {
    // Get available courts
    const availableCourts = tournament.courts ? parseCourts(tournament.courts) : [];
    const randomCourt = availableCourts.length > 0
      ? availableCourts[Math.floor(Math.random() * availableCourts.length)]
      : 'TBD';

    return {
      id: `placeholder-final-${tournament.id}`,
      round: 'final',
      team1: { firstName: 'Winner', lastName: 'SF1', userId: 'placeholder' },
      team2: { firstName: 'Winner', lastName: 'SF2', userId: 'placeholder' },
      tournamentName: tournament.name,
      tournamentId: tournament.id,
      location: tournament.location,
      court: randomCourt,
      dateTime: tournament.dateTime,
      status: 'Upcoming',
      scoreRecorded: false,
      score: null,
      winningTeam: null,
      groupName: 'Final'
    };
  };

  const checkAndProgressTournament = async (tournamentId, updatedMatchesArray = null) => {
    console.log('🚀 checkAndProgressTournament CALLED with tournamentId:', tournamentId);

    const tournament = getTournamentById(tournamentId);
    if (!tournament) {
      console.error('❌ Tournament not found:', tournamentId);
      return;
    }

    // Use provided matches array if available (to avoid race condition)
    const matchesToCheck = updatedMatchesArray || tournament.matches;

    console.log('🔍 Checking tournament progression:', {
      tournamentId,
      status: tournament.status,
      hasMatches: !!matchesToCheck,
      matchCount: matchesToCheck?.length,
      groupMatches: matchesToCheck?.filter(m => m.groupId).length,
      groupMatchesComplete: matchesToCheck?.filter(m => m.groupId && m.scoreRecorded).length,
      usingProvidedMatches: !!updatedMatchesArray
    });

    // Debug: Check if all group matches are complete
    const groupMatches = matchesToCheck?.filter(match => match.groupId) || [];
    const allComplete = groupMatches.length > 0 && groupMatches.every(match => match.scoreRecorded);
    console.log('📊 Group stage completion check:', {
      totalGroupMatches: groupMatches.length,
      completedGroupMatches: groupMatches.filter(m => m.scoreRecorded).length,
      allComplete,
      currentStatus: tournament.status
    });

    // GROUP STAGE → KNOCKOUT
    const tournamentWithUpdatedMatches = { ...tournament, matches: matchesToCheck };
    if (tournament.status === 'GROUP STAGE' && areAllGroupMatchesComplete(tournamentWithUpdatedMatches)) {
      console.log('✅ All group matches complete. Creating knockout matches...');

      const knockoutMatches = createKnockoutMatches(tournament);

      console.log('📋 Before filtering:', {
        totalMatches: matchesToCheck.length,
        placeholderMatches: matchesToCheck.filter(m => m.id?.includes('placeholder')).length
      });

      // Remove placeholder knockout and final matches before adding real ones
      const nonPlaceholderMatches = matchesToCheck.filter(match =>
        !match.id?.includes('placeholder')
      );

      console.log('📋 After filtering:', {
        nonPlaceholderMatches: nonPlaceholderMatches.length,
        knockoutMatches: knockoutMatches.length
      });

      // Create placeholder final match
      const placeholderFinal = createPlaceholderFinal(tournament);

      const allMatches = [...nonPlaceholderMatches, ...knockoutMatches, placeholderFinal];

      console.log('📋 Final matches array:', {
        total: allMatches.length,
        matchIds: allMatches.map(m => m.id)
      });

      await updateDocument('tournaments', tournamentId, {
        status: 'KNOCKOUT',
        matches: allMatches
      });

      const participantIds = getTournamentParticipantIds(tournament);
      await createNotificationsForUsers(participantIds, {
        type: 'tournament',
        action: 'knockout_stage',
        title: 'Knockout Stage Started!',
        message: `${tournament.name} has progressed to the knockout stage`,
        metadata: { tournamentId, tournamentName: tournament.name }
      });

      console.log('✅ Tournament progressed to KNOCKOUT stage');
      return;
    }

    // KNOCKOUT → FINALS
    if (tournament.status === 'KNOCKOUT' && areAllKnockoutMatchesComplete(tournamentWithUpdatedMatches)) {
      console.log('✅ All knockout matches complete. Creating final match...');

      const finalMatch = createFinalMatch(tournamentWithUpdatedMatches);
      if (!finalMatch) {
        console.error('❌ Could not create final match');
        return;
      }

      // Remove placeholder final match before adding real one
      const nonPlaceholderMatches = matchesToCheck.filter(match =>
        !match.id?.includes('placeholder')
      );

      const allMatches = [...nonPlaceholderMatches, finalMatch];

      await updateDocument('tournaments', tournamentId, {
        status: 'FINALS',
        matches: allMatches
      });

      const participantIds = getTournamentParticipantIds(tournament);
      await createNotificationsForUsers(participantIds, {
        type: 'tournament',
        action: 'finals_stage',
        title: 'Finals Started!',
        message: `${tournament.name} finals are ready!`,
        metadata: { tournamentId, tournamentName: tournament.name }
      });

      console.log('✅ Tournament progressed to FINALS stage');
      return;
    }

    // FINALS → FINISHED
    const finalMatch = matchesToCheck?.find(m => m.round === 'final');
    if (tournament.status === 'FINALS' && finalMatch?.scoreRecorded) {
      console.log('✅ Final match complete. Tournament finished!');

      // Determine the winner from the final match
      const winnerTeam = finalMatch.winningTeam === 'left' ? finalMatch.team1 : finalMatch.team2;

      await updateDocument('tournaments', tournamentId, {
        status: 'FINISHED',
        winner: winnerTeam
      });

      const participantIds = getTournamentParticipantIds(tournament);

      const winnerName = winnerTeam.player2 && winnerTeam.player2.firstName
        ? `${winnerTeam.player1.firstName} & ${winnerTeam.player2.firstName}`
        : `${winnerTeam.player1.firstName} ${winnerTeam.player1.lastName}`;

      await createNotificationsForUsers(participantIds, {
        type: 'tournament',
        action: 'tournament_completed',
        title: 'Tournament Complete!',
        message: `${tournament.name} has finished! Winners: ${winnerName} 🏆`,
        metadata: { tournamentId, tournamentName: tournament.name }
      });

      console.log('✅ Tournament marked as FINISHED');
    }
  };

  /**
   * Manually start knockout stage (called by admin)
   */
  const startKnockoutStage = async (tournamentId) => {
    const tournament = getTournamentById(tournamentId);
    if (!tournament) {
      console.error('❌ Tournament not found');
      return { success: false, error: 'Tournament not found' };
    }

    if (tournament.status !== 'GROUP STAGE') {
      console.error('❌ Tournament is not in GROUP STAGE');
      return { success: false, error: 'Tournament is not in GROUP STAGE' };
    }

    // Check if all group matches are complete
    const groupMatches = tournament.matches?.filter(match => match.groupId) || [];
    const allComplete = groupMatches.length > 0 && groupMatches.every(match => match.scoreRecorded);

    if (!allComplete) {
      console.error('❌ Not all group matches are complete');
      return { success: false, error: 'Not all group matches have scores recorded' };
    }

    console.log('✅ Starting knockout stage manually...');

    // Create knockout matches
    const knockoutMatches = createKnockoutMatches(tournament);

    if (!knockoutMatches || knockoutMatches.length === 0) {
      console.error('❌ Failed to create knockout matches');
      return { success: false, error: 'Failed to create knockout matches' };
    }

    // Remove placeholder matches
    const nonPlaceholderMatches = tournament.matches.filter(match =>
      !match.id?.includes('placeholder')
    );

    // Create placeholder final match
    const placeholderFinal = createPlaceholderFinal(tournament);

    const allMatches = [...nonPlaceholderMatches, ...knockoutMatches, placeholderFinal];

    // Update tournament
    await updateDocument('tournaments', tournamentId, {
      status: 'KNOCKOUT',
      matches: allMatches
    });

    // Send notifications
    const participantIds = getTournamentParticipantIds(tournament);
    await createNotificationsForUsers(participantIds, {
      type: 'tournament',
      action: 'knockout_stage',
      title: 'Knockout Stage Started!',
      message: `${tournament.name} has progressed to the knockout stage`,
      metadata: { tournamentId, tournamentName: tournament.name }
    });

    console.log('✅ Knockout stage started successfully');
    return { success: true };
  };

  /**
   * Manually start finals stage (called by admin)
   */
  const startFinalsStage = async (tournamentId) => {
    const tournament = getTournamentById(tournamentId);
    if (!tournament) {
      console.error('❌ Tournament not found');
      return { success: false, error: 'Tournament not found' };
    }

    if (tournament.status !== 'KNOCKOUT') {
      console.error('❌ Tournament is not in KNOCKOUT stage');
      return { success: false, error: 'Tournament is not in KNOCKOUT stage' };
    }

    // Check if all knockout matches are complete
    const knockoutMatches = tournament.matches?.filter(match =>
      match.round === 'semifinal' || match.round === 'knockout'
    ) || [];
    const allComplete = knockoutMatches.length > 0 && knockoutMatches.every(match => match.scoreRecorded);

    if (!allComplete) {
      console.error('❌ Not all knockout matches are complete');
      return { success: false, error: 'Not all knockout matches have scores recorded' };
    }

    console.log('✅ Starting finals stage manually...');

    // Create final match
    const finalMatch = createFinalMatch(tournament);
    if (!finalMatch) {
      console.error('❌ Failed to create final match');
      return { success: false, error: 'Failed to create final match' };
    }

    // Remove placeholder final match
    const nonPlaceholderMatches = tournament.matches.filter(match =>
      !match.id?.includes('placeholder')
    );

    const allMatches = [...nonPlaceholderMatches, finalMatch];

    // Update tournament
    await updateDocument('tournaments', tournamentId, {
      status: 'FINALS',
      matches: allMatches
    });

    // Send notifications
    const participantIds = getTournamentParticipantIds(tournament);
    await createNotificationsForUsers(participantIds, {
      type: 'tournament',
      action: 'finals_stage',
      title: 'Finals Started!',
      message: `${tournament.name} finals are ready!`,
      metadata: { tournamentId, tournamentName: tournament.name }
    });

    console.log('✅ Finals stage started successfully');
    return { success: true };
  };

  /**
   * MIGRATION: Fix knockout matches missing dateTime and tournamentId
   * This is a one-time migration function to fix existing tournaments
   */
  const fixKnockoutMatches = async (tournamentId) => {
    const tournament = getTournamentById(tournamentId);
    if (!tournament) {
      console.error('❌ Tournament not found');
      return { success: false, error: 'Tournament not found' };
    }

    console.log('🔧 Fixing knockout matches for tournament:', tournamentId);

    // Find all knockout and final matches that are missing dateTime or tournamentId
    const updatedMatches = tournament.matches.map(match => {
      if ((match.round === 'semifinal' || match.round === 'final') && (!match.dateTime || !match.tournamentId)) {
        console.log('🔧 Fixing match:', match.id);
        return {
          ...match,
          dateTime: match.dateTime || tournament.dateTime,
          tournamentId: match.tournamentId || tournament.id,
        };
      }
      return match;
    });

    // Update the tournament with fixed matches
    await updateDocument('tournaments', tournamentId, {
      matches: updatedMatches
    });

    console.log('✅ Knockout matches fixed');
    return { success: true };
  };

  /**
   * Update a tournament
   * Notification: Tournament Updated (sent to all participants if significant change)
   */
  const updateTournament = async (tournamentId, updates) => {
    const tournament = getTournamentById(tournamentId);
    if (!tournament) return;

    console.log('🔄 [TournamentContext] updateTournament called', {
      tournamentId,
      hasMatches: !!tournament.matches,
      matchCount: tournament.matches?.length || 0,
      locationUpdate: updates.location,
      oldLocation: tournament.location,
      dateTimeUpdate: updates.dateTime,
      oldDateTime: tournament.dateTime,
      courtsUpdate: updates.courts,
      oldCourts: tournament.courts,
      firstMatchOldCourt: tournament.matches?.[0]?.court
    });

    // If matches exist and scheduling-related fields changed, reschedule
    if (tournament.matches && tournament.matches.length > 0) {
      // Parse court counts to detect if the NUMBER of courts changed (not just names)
      const oldCourtCount = tournament.courts ? parseCourts(tournament.courts).length : 1;
      const newCourtCount = updates.courts ? parseCourts(updates.courts).length : oldCourtCount;

      // Only reschedule if date/time changes OR court COUNT changes
      const shouldReschedule =
        (updates.dateTime && updates.dateTime !== tournament.dateTime) ||
        (updates.courts && newCourtCount !== oldCourtCount);

      if (shouldReschedule) {
        console.log('🔄 Rescheduling needed for changes:', {
          dateTime: updates.dateTime && updates.dateTime !== tournament.dateTime,
          courtCountChanged: newCourtCount !== oldCourtCount,
          oldCourtCount,
          newCourtCount
        });

        const newDateTime = updates.dateTime || tournament.dateTime;
        const newCourts = updates.courts || tournament.courts;
        const newLocation = updates.location || tournament.location;

        const rescheduledMatches = rescheduleMatches(
          tournament,
          newDateTime,
          newCourts,
          newLocation
        );

        updates.matches = rescheduledMatches;
      } else {
        // Handle simple field updates without rescheduling
        let updatedMatches = tournament.matches;
        let hasChanges = false;

        // Collect all fields that need updating
        const fieldsToUpdate = {};

        // Check if court NAMES changed (not count)
        if (updates.courts && updates.courts !== tournament.courts && newCourtCount === oldCourtCount) {
          // Court names changed but count is the same - remap court names
          const oldCourtNames = parseCourts(tournament.courts);
          const newCourtNames = parseCourts(updates.courts);

          console.log('🏷️ Court name remapping triggered:', {
            oldCourtsInput: tournament.courts,
            newCourtsInput: updates.courts,
            oldCourtNames,
            newCourtNames,
            oldCourtCount,
            newCourtCount,
            sampleOldMatchCourt: updatedMatches[0]?.court
          });

          // Create a mapping from old court names to new court names
          const courtMapping = {};
          oldCourtNames.forEach((oldName, index) => {
            courtMapping[oldName] = newCourtNames[index];
          });

          console.log('📋 Court mapping created:', courtMapping);

          // Update court names in all matches - SINGLE map operation with all updates
          updatedMatches = updatedMatches.map(match => ({
            ...match,
            court: courtMapping[match.court] || match.court
          }));

          console.log('✅ Court names remapped. Sample new court:', updatedMatches[0]?.court);

          hasChanges = true;
        } else {
          console.log('⏭️ Court name remapping skipped:', {
            courtsChanged: updates.courts !== tournament.courts,
            courtsProvided: !!updates.courts,
            oldCourtCount,
            newCourtCount,
            countsSame: newCourtCount === oldCourtCount
          });
        }

        // Check for location or tournament name updates
        if (updates.location && updates.location !== tournament.location) {
          fieldsToUpdate.location = updates.location;
        }
        if (updates.name && updates.name !== tournament.name) {
          fieldsToUpdate.tournamentName = updates.name;
        }

        // Apply field updates in a SINGLE map operation
        if (Object.keys(fieldsToUpdate).length > 0) {
          console.log('📝 Updating match fields without rescheduling:', fieldsToUpdate);
          updatedMatches = updatedMatches.map(match => ({
            ...match,
            ...fieldsToUpdate
          }));
          hasChanges = true;
        }

        // Only update matches if something changed
        if (hasChanges) {
          // Sanitize updatedMatches to remove any undefined values before saving
          const sanitizedMatches = updatedMatches.map(match => {
            const cleanMatch = { ...match };
            Object.keys(cleanMatch).forEach(key => {
              if (cleanMatch[key] === undefined) {
                delete cleanMatch[key];
              }
            });
            // Ensure court is not undefined if explicitly set
            if (cleanMatch.court === undefined && match.court !== undefined) {
              cleanMatch.court = null;
            }
            return cleanMatch;
          });

          console.log('✅ Saving updated matches to Firestore. Sample match:', {
            court: sanitizedMatches[0]?.court,
            location: sanitizedMatches[0]?.location,
            tournamentName: sanitizedMatches[0]?.tournamentName
          });
          updates.matches = sanitizedMatches;
        }
      }
    } else {
      console.log('⚠️ No matches to reschedule');
    }

    // Final security check for undefined values
    const finalUpdates = { ...updates };
    Object.keys(finalUpdates).forEach(key => {
      if (finalUpdates[key] === undefined) delete finalUpdates[key];
    });

    console.log('📝 FINAL UPDATE PAYLOAD:', JSON.stringify(finalUpdates, null, 2));

    const { error } = await updateDocument('tournaments', tournamentId, finalUpdates);

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
   * - Updates participantIds to remove the player
   * - Clears joinAsPlayer flag if all teams are removed
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

      // Get the player being removed
      const removedPlayer = team[playerPosition];
      const removedPlayerId = removedPlayer?.userId;

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

      // Update participantIds - remove the player who was removed
      let updatedParticipantIds = tournament.participantIds || [];
      if (removedPlayerId) {
        updatedParticipantIds = updatedParticipantIds.filter(id => id !== removedPlayerId);
      }

      // Prepare updates object
      const updates = {
        teams: updatedTeams,
        registeredTeams,
        participantIds: updatedParticipantIds
      };

      // If all teams are removed, clear the joinAsPlayer flag
      // This prevents the UI from re-adding the player based on stale flag
      if (updatedTeams.length === 0) {
        updates.joinAsPlayer = false;
      }

      // Update tournament in Firestore
      await updateDocument('tournaments', tournamentId, updates);

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
      (t.status === 'REGISTRATION' ||
        t.status === 'GROUP STAGE' ||
        t.status === 'SEMI FINALS' ||
        t.status === 'KNOCKOUT' ||
        t.status === 'FINALS') &&
      // Private mode: only show if host or participant
      userData && (t.hostId === userData.uid || t.participantIds?.includes(userData.uid))
    );
  };

  const getCompletedTournaments = () => {
    return tournaments.filter((t) =>
      t.status === 'FINISHED' &&
      // Private mode: only show if host or participant
      userData && (t.hostId === userData.uid || t.participantIds?.includes(userData.uid))
    );
  };

  /**
   * MIGRATION: Fix tournaments with status 'COMPLETED' to 'FINISHED'
   * Also sets the winner field from the final match
   */
  const migrateCompletedToFinished = async () => {
    const tournamentsToMigrate = tournaments.filter(t => t.status === 'COMPLETED');

    if (tournamentsToMigrate.length === 0) {
      console.log('✅ No tournaments need migration');
      return { success: true, migrated: 0 };
    }

    console.log(`🔄 Migrating ${tournamentsToMigrate.length} tournaments from COMPLETED to FINISHED`);

    for (const tournament of tournamentsToMigrate) {
      const finalMatch = tournament.matches?.find(m => m.round === 'final');
      const winnerTeam = finalMatch?.winningTeam === 'left' ? finalMatch?.team1 : finalMatch?.team2;

      await updateDocument('tournaments', tournament.id, {
        status: 'FINISHED',
        ...(winnerTeam && { winner: winnerTeam })
      });

      console.log(`✅ Migrated tournament: ${tournament.name}`);
    }

    return { success: true, migrated: tournamentsToMigrate.length };
  };

  const value = {
    tournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    startTournament,
    startKnockoutStage,
    startFinalsStage,
    fixKnockoutMatches,
    joinTournamentTeam,
    removePlayerFromTeam,
    getTournamentById,
    getHostedTournaments,
    getJoinedTournaments,
    getOngoingTournaments,
    getCompletedTournaments,
    checkAndProgressTournament,
    migrateCompletedToFinished,
    isLoaded,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};
