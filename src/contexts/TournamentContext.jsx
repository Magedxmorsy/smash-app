import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const TournamentContext = createContext({});

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournaments must be used within a TournamentProvider');
  }
  return context;
};

// Dummy tournament data covering various scenarios
const dummyTournaments = [
  // Scenario 1: Host's tournament - Empty (0% filled)
  {
    id: 'dummy-1',
    name: 'Summer Padel Championship',
    location: 'PadelPoints Amsterdam',
    courts: 'Courts: 1, 2, 3',
    dateTime: new Date(2025, 6, 15, 18, 0).toISOString(), // July 15, 2025, 6:00 PM
    format: 'World cup format',
    teamCount: 8,
    registeredTeams: 0,
    rules: 'Standard padel rules apply. Each match is best of 3 sets. First team to 6 games wins the set. Tie-break at 6-6. Golden point on deuce.',
    status: 'REGISTRATION',
    hostId: 'current-user', // Will be replaced with actual user ID
    hostName: 'You',
    createdAt: new Date(2025, 5, 1).toISOString(),
    joinAsPlayer: false,
  },
  // Scenario 2: Host's tournament - Only host joined (12.5% filled - 1/8 teams = 2/16 players)
  {
    id: 'dummy-2',
    name: 'Weekend Warriors Cup',
    location: 'Padel Club Rotterdam',
    courts: 'Court: 5',
    dateTime: new Date(2025, 6, 20, 10, 0).toISOString(), // July 20, 2025, 10:00 AM
    format: 'World cup format',
    teamCount: 8,
    registeredTeams: 1,
    rules: 'Friendly tournament. Win by 2 points. No tie-breaks.',
    status: 'REGISTRATION',
    hostId: 'current-user',
    hostName: 'You',
    createdAt: new Date(2025, 5, 5).toISOString(),
    joinAsPlayer: true,
    teams: [
      { player1: { firstName: 'Host', lastName: 'Player', avatarSource: require('../../assets/avatars/ahmed.jpg'), userId: 'current-user' }, player2: null, isAdminTeam: true },
    ],
  },
  // Scenario 3: Host's tournament - 40% filled (below 50%)
  {
    id: 'dummy-3',
    name: 'Utrecht Open Tournament',
    location: 'Padel Utrecht Central',
    courts: 'Courts: 2, 4, 6',
    dateTime: new Date(2025, 6, 25, 14, 0).toISOString(), // July 25, 2025, 2:00 PM
    format: 'World cup format',
    teamCount: 10,
    registeredTeams: 4,
    rules: 'Professional rules. Coaching allowed between sets.',
    status: 'REGISTRATION',
    hostId: 'current-user',
    hostName: 'You',
    createdAt: new Date(2025, 5, 10).toISOString(),
    joinAsPlayer: true,
    teams: [
      { player1: { firstName: 'Host', lastName: 'Player', avatarSource: require('../../assets/avatars/ahmed.jpg'), userId: 'current-user' }, player2: { firstName: 'John', lastName: 'Smith', avatarSource: require('../../assets/avatars/leo.jpg') }, isAdminTeam: true },
      { player1: { firstName: 'Emma', lastName: 'Johnson', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Mike', lastName: 'Brown', avatarSource: require('../../assets/avatars/chris.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Sarah', lastName: 'Davis', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Tom', lastName: 'Wilson', avatarSource: require('../../assets/avatars/omar.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Lisa', lastName: 'Taylor', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'James', lastName: 'Anderson', avatarSource: require('../../assets/avatars/james.jpg') }, isAdminTeam: false },
    ],
  },
  // Scenario 4: Host's tournament - 60% filled (above 50%)
  {
    id: 'dummy-4',
    name: 'Den Haag Masters',
    location: 'The Hague Padel Center',
    courts: 'Courts: 1, 3, 5, 7',
    dateTime: new Date(2025, 7, 1, 19, 0).toISOString(), // Aug 1, 2025, 7:00 PM
    format: 'World cup format',
    teamCount: 8,
    registeredTeams: 5,
    rules: 'Advanced tournament. Previous tournament experience required.',
    status: 'REGISTRATION',
    hostId: 'current-user',
    hostName: 'You',
    createdAt: new Date(2025, 5, 15).toISOString(),
    joinAsPlayer: true,
    teams: [
      { player1: { firstName: 'Host', lastName: 'Player', avatarSource: require('../../assets/avatars/ahmed.jpg'), userId: 'current-user' }, player2: { firstName: 'Partner', lastName: 'One', avatarSource: require('../../assets/avatars/alan.jpg') }, isAdminTeam: true },
      { player1: { firstName: 'Alex', lastName: 'Rodriguez', avatarSource: require('../../assets/avatars/alex.jpg') }, player2: { firstName: 'Maria', lastName: 'Garcia', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Chris', lastName: 'Lee', avatarSource: require('../../assets/avatars/chris.jpg') }, player2: { firstName: 'Anna', lastName: 'Martinez', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'David', lastName: 'Kim', avatarSource: require('../../assets/avatars/karim.jpg') }, player2: { firstName: 'Sophie', lastName: 'Chen', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Ryan', lastName: 'O\'Connor', avatarSource: require('../../assets/avatars/omar.jpg') }, player2: { firstName: 'Mia', lastName: 'Patel', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
    ],
  },
  // Scenario 5: Host's tournament - 100% filled (ready to start)
  {
    id: 'dummy-5',
    name: 'Eindhoven Championship Finals',
    location: 'Eindhoven Sports Complex',
    courts: 'Courts: 1, 2',
    dateTime: new Date(2025, 7, 10, 16, 0).toISOString(), // Aug 10, 2025, 4:00 PM
    format: 'World cup format',
    teamCount: 8,
    registeredTeams: 8,
    rules: 'Championship rules. No substitutions allowed.',
    status: 'REGISTRATION',
    hostId: 'current-user',
    hostName: 'You',
    createdAt: new Date(2025, 5, 20).toISOString(),
    joinAsPlayer: true,
    teams: [
      { player1: { firstName: 'Host', lastName: 'Player', avatarSource: require('../../assets/avatars/ahmed.jpg'), userId: 'current-user' }, player2: { firstName: 'Team', lastName: 'Mate', avatarSource: require('../../assets/avatars/mitch.jpg') }, isAdminTeam: true },
      { player1: { firstName: 'Lucas', lastName: 'Silva', avatarSource: require('../../assets/avatars/lucas.jpg') }, player2: { firstName: 'Nina', lastName: 'Fernandez', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Max', lastName: 'Weber', avatarSource: require('../../assets/avatars/miguel.jpg') }, player2: { firstName: 'Elena', lastName: 'Ivanova', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Oliver', lastName: 'Hansen', avatarSource: require('../../assets/avatars/oorgive.jpg') }, player2: { firstName: 'Zara', lastName: 'Ali', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Jack', lastName: 'McAlfred', avatarSource: require('../../assets/avatars/jack.jpg') }, player2: { firstName: 'Karim', lastName: 'Omar', avatarSource: require('../../assets/avatars/karim.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Leo', lastName: 'Miguele', avatarSource: require('../../assets/avatars/leo.jpg') }, player2: { firstName: 'Omar', lastName: 'Ibrahim', avatarSource: require('../../assets/avatars/omar.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Alan', lastName: 'Faynne', avatarSource: require('../../assets/avatars/alan.jpg') }, player2: { firstName: 'Chris', lastName: 'Morgan', avatarSource: require('../../assets/avatars/chris.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'James', lastName: 'Parker', avatarSource: require('../../assets/avatars/james.jpg') }, player2: { firstName: 'Alex', lastName: 'Turner', avatarSource: require('../../assets/avatars/alex.jpg') }, isAdminTeam: false },
    ],
  },
  // Scenario 6: Other user's tournament - Not joined yet
  {
    id: 'dummy-6',
    name: 'Groningen Amateur League',
    location: 'Groningen Padel Arena',
    courts: 'Courts: 3, 4',
    dateTime: new Date(2025, 7, 15, 11, 0).toISOString(), // Aug 15, 2025, 11:00 AM
    format: 'World cup format',
    teamCount: 6,
    registeredTeams: 2,
    rules: 'Beginners welcome. Fun tournament with prizes.',
    status: 'REGISTRATION',
    hostId: 'other-user-1',
    hostName: 'Sarah Johnson',
    createdAt: new Date(2025, 5, 22).toISOString(),
    joinAsPlayer: false,
    teams: [
      { player1: { firstName: 'Sarah', lastName: 'Johnson', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Mike', lastName: 'Brown', avatarSource: require('../../assets/avatars/miguel.jpg') }, isAdminTeam: true },
      { player1: { firstName: 'Emma', lastName: 'Davis', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Tom', lastName: 'Wilson', avatarSource: require('../../assets/avatars/chris.jpg') }, isAdminTeam: false },
    ],
  },
  // Scenario 7: Other user's tournament - Already joined
  {
    id: 'dummy-7',
    name: 'Maastricht Pro Series',
    location: 'Maastricht Padel Club',
    courts: 'Courts: 1, 2, 3, 4',
    dateTime: new Date(2025, 7, 20, 9, 0).toISOString(), // Aug 20, 2025, 9:00 AM
    format: 'World cup format',
    teamCount: 12,
    registeredTeams: 8,
    rules: 'Professional level. Strict time limits on games.',
    status: 'REGISTRATION',
    hostId: 'other-user-2',
    hostName: 'Mark van der Berg',
    createdAt: new Date(2025, 5, 25).toISOString(),
    joinAsPlayer: false,
    teams: [
      { player1: { firstName: 'Mark', lastName: 'van der Berg', avatarSource: require('../../assets/avatars/miguel.jpg') }, player2: { firstName: 'Lisa', lastName: 'Peters', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: true },
      { player1: { firstName: 'Alex', lastName: 'Rodriguez', avatarSource: require('../../assets/avatars/alex.jpg') }, player2: { firstName: 'Maria', lastName: 'Garcia', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Chris', lastName: 'Lee', avatarSource: require('../../assets/avatars/chris.jpg') }, player2: { firstName: 'Anna', lastName: 'Martinez', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'David', lastName: 'Kim', avatarSource: require('../../assets/avatars/karim.jpg') }, player2: { firstName: 'Sophie', lastName: 'Chen', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Ryan', lastName: 'O\'Connor', avatarSource: require('../../assets/avatars/omar.jpg') }, player2: { firstName: 'Mia', lastName: 'Patel', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Lucas', lastName: 'Silva', avatarSource: require('../../assets/avatars/lucas.jpg') }, player2: { firstName: 'Nina', lastName: 'Fernandez', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Max', lastName: 'Weber', avatarSource: require('../../assets/avatars/miguel.jpg') }, player2: { firstName: 'Elena', lastName: 'Ivanova', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Oliver', lastName: 'Hansen', avatarSource: require('../../assets/avatars/oorgive.jpg') }, player2: { firstName: 'Zara', lastName: 'Ali', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
    ],
  },
  // Scenario 8: Tournament in progress - Group stage
  {
    id: 'dummy-8',
    name: 'Haarlem Spring Cup',
    location: 'Haarlem Sports Center',
    courts: 'Courts: 2, 4',
    dateTime: new Date(2025, 5, 28, 15, 0).toISOString(), // June 28, 2025, 3:00 PM (past)
    format: 'World cup format',
    teamCount: 8,
    registeredTeams: 8,
    rules: 'Standard rules. Group winners advance.',
    status: 'GROUP STAGE',
    hostId: 'other-user-3',
    hostName: 'Emma Peters',
    createdAt: new Date(2025, 4, 1).toISOString(),
    joinAsPlayer: false,
    teams: [
      { player1: { firstName: 'Emma', lastName: 'Peters', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Mark', lastName: 'Johnson', avatarSource: require('../../assets/avatars/miguel.jpg') }, isAdminTeam: true },
      { player1: { firstName: 'Sophie', lastName: 'Anderson', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Tom', lastName: 'Williams', avatarSource: require('../../assets/avatars/omar.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Lisa', lastName: 'Brown', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Paul', lastName: 'Davis', avatarSource: require('../../assets/avatars/james.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Nina', lastName: 'Martinez', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Carlos', lastName: 'Lopez', avatarSource: require('../../assets/avatars/chris.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Hannah', lastName: 'Wilson', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Daniel', lastName: 'Moore', avatarSource: require('../../assets/avatars/karim.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Rachel', lastName: 'Taylor', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Jake', lastName: 'Thomas', avatarSource: require('../../assets/avatars/leo.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Emily', lastName: 'White', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Ryan', lastName: 'Harris', avatarSource: require('../../assets/avatars/alan.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Grace', lastName: 'Clark', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Ben', lastName: 'Lewis', avatarSource: require('../../assets/avatars/alex.jpg') }, isAdminTeam: false },
    ],
  },
  // Scenario 9: Small tournament - Only host joined (1 player, looking for partner)
  {
    id: 'dummy-9',
    name: 'Friday Night Smash',
    location: 'Downtown Padel',
    courts: 'Court: 1',
    dateTime: new Date(2025, 7, 5, 20, 0).toISOString(), // Aug 5, 2025, 8:00 PM
    format: 'World cup format',
    teamCount: 4,
    registeredTeams: 1,
    rules: 'Quick games. First to 4 points wins.',
    status: 'REGISTRATION',
    hostId: 'current-user',
    hostName: 'You',
    createdAt: new Date(2025, 6, 1).toISOString(),
    joinAsPlayer: true,
    teams: [
      { player1: { firstName: 'Host', lastName: 'Player', avatarSource: require('../../assets/avatars/ahmed.jpg'), userId: 'current-user' }, player2: null, isAdminTeam: true },
    ],
  },
  // Scenario 10: Large tournament - 16 teams
  {
    id: 'dummy-10',
    name: 'Netherlands National Open',
    location: 'National Padel Stadium',
    courts: 'Courts: 1-8',
    dateTime: new Date(2025, 8, 1, 9, 0).toISOString(), // Sept 1, 2025, 9:00 AM
    format: 'World cup format',
    teamCount: 16,
    registeredTeams: 12,
    rules: 'National championship rules. Tournament spans 2 days.',
    status: 'REGISTRATION',
    hostId: 'other-user-4',
    hostName: 'Tournament Committee',
    createdAt: new Date(2025, 6, 1).toISOString(),
    joinAsPlayer: false,
    teams: [
      { player1: { firstName: 'John', lastName: 'Smith', avatarSource: require('../../assets/avatars/james.jpg') }, player2: { firstName: 'Emma', lastName: 'Wilson', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: true },
      { player1: { firstName: 'Leo', lastName: 'Miguele', avatarSource: require('../../assets/avatars/leo.jpg') }, player2: { firstName: 'Sophia', lastName: 'Taylor', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Ahmed', lastName: 'Basyouni', avatarSource: require('../../assets/avatars/ahmed.jpg') }, player2: { firstName: 'Lisa', lastName: 'Anderson', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Omar', lastName: 'Ibrahim', avatarSource: require('../../assets/avatars/omar.jpg') }, player2: { firstName: 'Kate', lastName: 'Johnson', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Lucas', lastName: 'Rodriguez', avatarSource: require('../../assets/avatars/lucas.jpg') }, player2: { firstName: 'Nina', lastName: 'Davis', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Karim', lastName: 'Omar', avatarSource: require('../../assets/avatars/karim.jpg') }, player2: { firstName: 'Rachel', lastName: 'White', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Mitch', lastName: 'Mogul', avatarSource: require('../../assets/avatars/mitch.jpg') }, player2: { firstName: 'Olivia', lastName: 'Brown', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Alan', lastName: 'Faynne', avatarSource: require('../../assets/avatars/alan.jpg') }, player2: { firstName: 'Hannah', lastName: 'Moore', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Chris', lastName: 'Morgan', avatarSource: require('../../assets/avatars/chris.jpg') }, player2: { firstName: 'Sarah', lastName: 'Miller', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Alex', lastName: 'Turner', avatarSource: require('../../assets/avatars/alex.jpg') }, player2: { firstName: 'Emily', lastName: 'Garcia', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Jack', lastName: 'McAlfred', avatarSource: require('../../assets/avatars/jack.jpg') }, player2: { firstName: 'Zara', lastName: 'Khan', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Miguel', lastName: 'Santos', avatarSource: require('../../assets/avatars/miguel.jpg') }, player2: { firstName: 'Anna', lastName: 'Petrov', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
    ],
  },
  // Scenario 11: 100% filled - User joined (player view)
  {
    id: 'dummy-11',
    name: 'Delft Summer Smash',
    location: 'Delft Padel Club',
    courts: 'Courts: 1, 2, 3',
    dateTime: new Date(2025, 7, 25, 18, 0).toISOString(), // Aug 25, 2025, 6:00 PM
    format: 'World cup format',
    teamCount: 6,
    registeredTeams: 6,
    rules: 'Summer tournament. Friendly competition.',
    status: 'REGISTRATION',
    hostId: 'other-user-5',
    hostName: 'Sarah Johnson',
    createdAt: new Date(2025, 6, 5).toISOString(),
    joinAsPlayer: false,
    teams: [
      { player1: { firstName: 'Sarah', lastName: 'Johnson', avatarSource: require('../../assets/avatars/orfa.jpg') }, player2: { firstName: 'Mike', lastName: 'Brown', avatarSource: require('../../assets/avatars/miguel.jpg') }, isAdminTeam: true },
      { player1: { firstName: 'Current', lastName: 'User', avatarSource: require('../../assets/avatars/ahmed.jpg'), userId: 'current-user' }, player2: { firstName: 'Partner', lastName: 'Name', avatarSource: require('../../assets/avatars/alan.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Alex', lastName: 'Rodriguez', avatarSource: require('../../assets/avatars/alex.jpg') }, player2: { firstName: 'Maria', lastName: 'Garcia', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Chris', lastName: 'Lee', avatarSource: require('../../assets/avatars/chris.jpg') }, player2: { firstName: 'Anna', lastName: 'Martinez', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'David', lastName: 'Kim', avatarSource: require('../../assets/avatars/karim.jpg') }, player2: { firstName: 'Sophie', lastName: 'Chen', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Ryan', lastName: 'O\'Connor', avatarSource: require('../../assets/avatars/omar.jpg') }, player2: { firstName: 'Mia', lastName: 'Patel', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
    ],
  },
  // Scenario 12: 100% filled - User NOT joined (spectator view)
  {
    id: 'dummy-12',
    name: 'Tilburg Elite Tournament',
    location: 'Tilburg Sports Arena',
    courts: 'Courts: 1, 2',
    dateTime: new Date(2025, 8, 5, 14, 0).toISOString(), // Sept 5, 2025, 2:00 PM
    format: 'World cup format',
    teamCount: 8,
    registeredTeams: 8,
    rules: 'Elite level tournament. Advanced players only.',
    status: 'REGISTRATION',
    hostId: 'other-user-6',
    hostName: 'Tournament Director',
    createdAt: new Date(2025, 6, 10).toISOString(),
    joinAsPlayer: false,
    teams: [
      { player1: { firstName: 'John', lastName: 'Smith', avatarSource: require('../../assets/avatars/james.jpg') }, player2: { firstName: 'Emma', lastName: 'Wilson', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: true },
      { player1: { firstName: 'Leo', lastName: 'Miguele', avatarSource: require('../../assets/avatars/leo.jpg') }, player2: { firstName: 'Sophia', lastName: 'Taylor', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Ahmed', lastName: 'Basyouni', avatarSource: require('../../assets/avatars/ahmed.jpg') }, player2: { firstName: 'Lisa', lastName: 'Anderson', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Omar', lastName: 'Ibrahim', avatarSource: require('../../assets/avatars/omar.jpg') }, player2: { firstName: 'Kate', lastName: 'Johnson', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Lucas', lastName: 'Rodriguez', avatarSource: require('../../assets/avatars/lucas.jpg') }, player2: { firstName: 'Nina', lastName: 'Davis', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Karim', lastName: 'Omar', avatarSource: require('../../assets/avatars/karim.jpg') }, player2: { firstName: 'Rachel', lastName: 'White', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Mitch', lastName: 'Mogul', avatarSource: require('../../assets/avatars/mitch.jpg') }, player2: { firstName: 'Olivia', lastName: 'Brown', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
      { player1: { firstName: 'Alan', lastName: 'Faynne', avatarSource: require('../../assets/avatars/alan.jpg') }, player2: { firstName: 'Hannah', lastName: 'Moore', avatarSource: require('../../assets/avatars/orfa.jpg') }, isAdminTeam: false },
    ],
  },
];

const TOURNAMENTS_STORAGE_KEY = '@tournaments_storage';

export const TournamentProvider = ({ children }) => {
  const { userData } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load tournaments from AsyncStorage on mount
  useEffect(() => {
    loadTournaments();
  }, []);

  // Save tournaments to AsyncStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveTournaments();
    }
  }, [tournaments, isLoaded]);

  const loadTournaments = async () => {
    try {
      const storedTournaments = await AsyncStorage.getItem(TOURNAMENTS_STORAGE_KEY);
      if (storedTournaments) {
        setTournaments(JSON.parse(storedTournaments));
      } else {
        // First time - initialize with dummy data
        const currentUserId = userData?.uid || 'dummy-user-id';
        const initialTournaments = dummyTournaments.map(tournament => {
          const updatedTournament = {
            ...tournament,
            hostId: tournament.hostId === 'current-user' ? currentUserId : tournament.hostId,
          };

          if (updatedTournament.teams && Array.isArray(updatedTournament.teams)) {
            updatedTournament.teams = updatedTournament.teams.map(team => ({
              ...team,
              player1: team.player1?.userId === 'current-user'
                ? { ...team.player1, userId: currentUserId }
                : team.player1,
              player2: team.player2?.userId === 'current-user'
                ? { ...team.player2, userId: currentUserId }
                : team.player2,
            }));
          }

          return updatedTournament;
        });
        setTournaments(initialTournaments);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveTournaments = async () => {
    try {
      await AsyncStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(tournaments));
    } catch (error) {
      console.error('Error saving tournaments:', error);
    }
  };

  const createTournament = (tournamentData) => {
    const newTournament = {
      id: Date.now().toString(), // Simple ID generation
      ...tournamentData,
      hostId: userData?.uid,
      hostName: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown',
      createdAt: new Date().toISOString(),
      status: 'REGISTRATION',
      registeredTeams: tournamentData.joinAsPlayer ? 1 : 0,
      teams: tournamentData.joinAsPlayer ? [
        {
          player1: {
            firstName: userData?.firstName || 'Host',
            lastName: userData?.lastName || 'Player',
            avatarSource: userData?.avatarUri ? { uri: userData.avatarUri } : null,
            userId: userData?.uid,
          },
          player2: null,
          isAdminTeam: true,
        }
      ] : [],
    };

    setTournaments((prev) => [newTournament, ...prev]);
    return newTournament;
  };

  const updateTournament = (tournamentId, updates) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? { ...t, ...updates } : t))
    );
  };

  const deleteTournament = (tournamentId) => {
    setTournaments((prev) => prev.filter((t) => t.id !== tournamentId));
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
      // Exclude tournaments where user is the host
      if (t.hostId === userData.uid) return false;

      // Check if user is in any of the teams
      if (t.teams && Array.isArray(t.teams)) {
        return t.teams.some((team) =>
          team.player1?.userId === userData.uid ||
          team.player2?.userId === userData.uid
        );
      }

      return false;
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
    getTournamentById,
    getHostedTournaments,
    getJoinedTournaments,
    getOngoingTournaments,
    getCompletedTournaments,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};
