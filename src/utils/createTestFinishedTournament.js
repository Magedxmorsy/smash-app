/**
 * Test Utility: Create a Finished Tournament with Winners
 *
 * This utility creates a dummy tournament in FINISHED status with complete match data
 * including a finals match with winners. Use this to test the WinnersBanner component.
 *
 * Usage:
 * 1. Import this in your App.js or any component
 * 2. Call createTestFinishedTournament(userData) once
 * 3. Check Firestore - you should see a new tournament
 * 4. Navigate to that tournament to see the winners banner
 */

import { createDocument } from '../services/firestoreService';

export const createTestFinishedTournament = async (userData) => {
  if (!userData?.uid) {
    console.error('❌ User must be logged in to create test tournament');
    return null;
  }

  const testTournament = {
    // Basic Info
    name: '🏆 Test Championship 2025',
    location: 'Test Arena',
    dateTime: new Date().toISOString(),
    numberOfTeams: 4,
    status: 'FINISHED',

    // Host Info
    hostId: userData.uid,
    hostName: `${userData.firstName} ${userData.lastName}`,

    // Tournament Settings
    format: 'Single Elimination',
    numberOfCourts: 2,
    matchDuration: 30,
    breakBetweenMatches: 5,
    rules: 'Test tournament rules',

    // Teams (4 teams for semifinals -> finals)
    registeredTeams: 4,
    participantIds: [userData.uid],
    teams: [
      {
        player1: {
          firstName: 'Leo',
          lastName: 'Miguele',
          avatarSource: null,
          userId: userData.uid,
        },
        player2: {
          firstName: 'John',
          lastName: 'Smith',
          avatarSource: null,
          userId: 'test_user_1',
        },
      },
      {
        player1: {
          firstName: 'Abdullah',
          lastName: 'Gaber',
          avatarSource: null,
          userId: 'test_user_2',
        },
        player2: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          avatarSource: null,
          userId: 'test_user_3',
        },
      },
      {
        player1: {
          firstName: 'Mike',
          lastName: 'Davis',
          avatarSource: null,
          userId: 'test_user_4',
        },
        player2: {
          firstName: 'Emma',
          lastName: 'Wilson',
          avatarSource: null,
          userId: 'test_user_5',
        },
      },
      {
        player1: {
          firstName: 'Chris',
          lastName: 'Brown',
          avatarSource: null,
          userId: 'test_user_6',
        },
        player2: {
          firstName: 'Lisa',
          lastName: 'Taylor',
          avatarSource: null,
          userId: 'test_user_7',
        },
      },
    ],

    // Matches (Semifinals + Finals)
    matches: [
      // Semifinal 1
      {
        id: 'match_1',
        round: 'Semifinals',
        matchNumber: 1,
        team1: {
          player1: { firstName: 'Leo', lastName: 'Miguele', avatarSource: null, userId: userData.uid },
          player2: { firstName: 'John', lastName: 'Smith', avatarSource: null, userId: 'test_user_1' },
        },
        team2: {
          player1: { firstName: 'Mike', lastName: 'Davis', avatarSource: null, userId: 'test_user_4' },
          player2: { firstName: 'Emma', lastName: 'Wilson', avatarSource: null, userId: 'test_user_5' },
        },
        winningTeam: 'left',
        score: { team1: 21, team2: 15 },
        status: 'completed',
      },
      // Semifinal 2
      {
        id: 'match_2',
        round: 'Semifinals',
        matchNumber: 2,
        team1: {
          player1: { firstName: 'Abdullah', lastName: 'Gaber', avatarSource: null, userId: 'test_user_2' },
          player2: { firstName: 'Sarah', lastName: 'Johnson', avatarSource: null, userId: 'test_user_3' },
        },
        team2: {
          player1: { firstName: 'Chris', lastName: 'Brown', avatarSource: null, userId: 'test_user_6' },
          player2: { firstName: 'Lisa', lastName: 'Taylor', avatarSource: null, userId: 'test_user_7' },
        },
        winningTeam: 'left',
        score: { team1: 21, team2: 18 },
        status: 'completed',
      },
      // FINALS - This is what WinnersBanner reads!
      {
        id: 'match_finals',
        round: 'Finals',
        matchNumber: 3,
        team1: {
          player1: { firstName: 'Leo', lastName: 'Miguele', avatarSource: null, userId: userData.uid },
          player2: { firstName: 'John', lastName: 'Smith', avatarSource: null, userId: 'test_user_1' },
        },
        team2: {
          player1: { firstName: 'Abdullah', lastName: 'Gaber', avatarSource: null, userId: 'test_user_2' },
          player2: { firstName: 'Sarah', lastName: 'Johnson', avatarSource: null, userId: 'test_user_3' },
        },
        winningTeam: 'left', // Leo & John win!
        score: { team1: 21, team2: 19 },
        status: 'completed',
      },
    ],

    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const { id, error } = await createDocument('tournaments', testTournament);

    if (error) {
      console.error('❌ Error creating test tournament:', error);
      return null;
    }

    console.log('✅ Test finished tournament created!');
    console.log('📋 Tournament ID:', id);
    console.log('🏆 Winners: Leo Miguele & John Smith');
    console.log('🎯 Navigate to this tournament to see the winners banner');

    return { ...testTournament, id };
  } catch (err) {
    console.error('❌ Exception creating test tournament:', err);
    return null;
  }
};

/**
 * Alternative: Update an existing tournament to FINISHED with winners
 */
export const markTournamentAsFinished = async (tournamentId, winningTeamIndex = 0) => {
  // This function would update an existing tournament
  // Implementation left as exercise - use updateDocument from firestoreService
  console.log('💡 To mark existing tournament as finished, use Firebase Console');
  console.log('1. Go to Firestore');
  console.log('2. Find your tournament');
  console.log('3. Set status to "FINISHED"');
  console.log('4. Add a finals match to the matches array with winningTeam field');
};
