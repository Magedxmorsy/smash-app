import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Animated, Share, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { scheduleMatches, parseCourts } from '../../utils/courtScheduler';
import { useAuth } from '../../contexts/AuthContext';
import { useTournaments } from '../../contexts/TournamentContext';
import { useToast } from '../../contexts/ToastContext';
import { createNotification, createNotificationsForUsers } from '../../services/notificationService';
import Button from '../../components/ui/Button';
import TabSelector from '../../components/ui/TabSelector';
import FilterChips from '../../components/ui/FilterChips';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DetailsListItem from '../../components/ui/DetailsListItem';
import EmptyState from '../../components/ui/EmptyState';
import TeamsList from '../../components/tournament/TeamsList';
import Player from '../../components/ui/Player';
import MatchCard from '../../components/match/MatchCard';
import RecordScoreModal from '../../components/match/RecordScoreModal';
import CreateTeamBottomSheet from '../../components/tournament/CreateTeamBottomSheet';
import JoinTeamBottomSheet from '../../components/tournament/JoinTeamBottomSheet';
import TournamentOptionsBottomSheet from '../../components/tournament/TournamentOptionsBottomSheet';
import CreateTournamentModal from '../../components/tournament/CreateTournamentModal';
import StartTournamentBottomSheet from '../../components/tournament/StartTournamentBottomSheet';

// Icons
import ChevronLeft from '../../../assets/icons/chevronleft.svg';
import MoreIcon from '../../../assets/icons/More.svg';
import ShareIcon from '../../../assets/icons/share.svg';
import LocationIcon from '../../../assets/icons/location.svg';
import BallIcon from '../../../assets/icons/ball.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';
import TimeIcon from '../../../assets/icons/time.svg';
import CompeteIcon from '../../../assets/icons/compete.svg';
import TeamIcon from '../../../assets/icons/team.svg';
import RulesIcon from '../../../assets/icons/rules.svg';
import ChevronDownIcon from '../../../assets/icons/chevrondown.svg';
import InfoIcon from '../../../assets/icons/infoicon.svg';
import CloseIcon from '../../../assets/icons/close.svg';

export default function TournamentDetailsScreen({ navigation, route }) {
  const { tournament: propTournament, tournamentId, onAuthRequired, openStartSheet } = route?.params || {};
  const { isAuthenticated, userData } = useAuth();
  const { deleteTournament, getTournamentById, updateTournament } = useTournaments();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Details');
  const [showCreateTeamSheet, setShowCreateTeamSheet] = useState(false);
  const [showJoinTeamSheet, setShowJoinTeamSheet] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStartTournamentSheet, setShowStartTournamentSheet] = useState(false);
  const [generatedGroups, setGeneratedGroups] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [userHasTeam, setUserHasTeam] = useState(false);
  const [expandedRounds, setExpandedRounds] = useState({ 1: true }); // Round 1 expanded by default
  const [selectedGroupPerRound, setSelectedGroupPerRound] = useState({}); // Track selected group per round
  const [showRecordScoreModal, setShowRecordScoreModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showFormatInfoSheet, setShowFormatInfoSheet] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  // Animated values for each round
  const roundAnimations = useRef({
    1: new Animated.Value(1), // Round 1 starts expanded
    2: new Animated.Value(0),
    3: new Animated.Value(0),
    4: new Animated.Value(0),
    5: new Animated.Value(0),
  }).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: rulesExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [rulesExpanded]);

  // Animate rounds when expandedRounds changes
  useEffect(() => {
    Object.keys(roundAnimations).forEach((roundKey) => {
      const roundNumber = parseInt(roundKey);
      Animated.timing(roundAnimations[roundKey], {
        toValue: expandedRounds[roundNumber] ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [expandedRounds]);

  // Open start tournament sheet if requested
  useEffect(() => {
    if (openStartSheet) {
      // Small delay to ensure the screen is fully rendered
      const timer = setTimeout(() => {
        setShowStartTournamentSheet(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [openStartSheet]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my tournament "${tournament.name}" on Smash! 🎾`,
        title: 'Join my tournament',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleJoinTournament = () => {
    // Check if user is authenticated first
    if (!isAuthenticated) {
      // Pass the action to execute after auth
      onAuthRequired && onAuthRequired(() => {
        setShowCreateTeamSheet(true);
      });
      return;
    }

    // Show create team sheet
    setShowCreateTeamSheet(true);
  };

  // Get fresh tournament data from context
  // Support both tournament object and tournamentId string
  let freshTournament = null;
  if (tournamentId) {
    // If tournamentId is provided, fetch by ID
    freshTournament = getTournamentById(tournamentId);
  } else if (propTournament?.id) {
    // If tournament object with ID is provided, fetch fresh data
    freshTournament = getTournamentById(propTournament.id);
  }

  const tournament = freshTournament || propTournament || {
    name: 'April friends challenge',
    status: 'REGISTRATION',
    location: 'PadelPoints Badhoevedorp',
    courts: 'Courts: 3, 7, 8',
    dateTime: 'June 12, 2025 | 8:00 PM',
    format: 'World cup format',
    teamCount: 8,
    registeredTeams: 3,
    rules: 'Standard padel rules apply. Each match is best of 3 sets. First team to 6 games wins the set. Tie-break at 6-6. Golden point on deuce.',
  };

  // Format date and time from tournament.dateTime
  const formatDateTime = () => {
    if (!tournament.dateTime) return 'TBD';

    const dateObj = new Date(tournament.dateTime);

    // Format date: "June 12, 2025"
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);

    // Format time: "4:00 PM"
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);

    return `${formattedDate} | ${formattedTime}`;
  };

  const tournamentDateTime = formatDateTime();

  // Check if current user is the tournament admin
  const isAdmin = userData && tournament.hostId && tournament.hostId === userData.uid;

  // Generate teams based on tournament data
  const generateTeams = () => {
    // If tournament already has teams data, use it
    if (tournament.teams && Array.isArray(tournament.teams) && tournament.teams.length > 0) {
      return tournament.teams;
    }

    // Otherwise generate teams dynamically
    const teamCount = tournament.teamCount || 8;
    const teams = [];

    // If tournament has joinAsPlayer flag and user data exists, add user to first team
    if (tournament.joinAsPlayer && userData) {
      const player1Data = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        userId: userData.uid, // Add userId to track team ownership
      };

      // Only add avatarSource if it exists (avoid null/undefined in Firestore)
      if (userData.avatarUri) {
        player1Data.avatarSource = { uri: userData.avatarUri };
      }

      teams.push({
        player1: player1Data,
        player2: null,
        isAdminTeam: isAdmin, // Mark if this is admin's team
      });
    }

    // Fill remaining teams with empty slots
    const remainingTeams = teamCount - teams.length;
    for (let i = 0; i < remainingTeams; i++) {
      teams.push({
        player1: null,
        player2: null,
        isAdminTeam: false,
      });
    }

    return teams;
  };

  const teams = generateTeams();

  // Check if current user already has a team (including when admin joins as player)
  const currentUserHasTeam = teams.some(team => {
    return (team.player1?.userId === userData?.uid) || (team.player2?.userId === userData?.uid);
  });

  // Calculate if tournament is full
  const filledTeams = teams.filter(t => t.player1 !== null && t.player2 !== null);
  const isTournamentFull = filledTeams.length === tournament.teamCount;

  // Old mock teams data for reference
  const mockTeams = [
    {
      player1: {
        firstName: 'Ahmed',
        lastName: 'Basyouni',
        avatarSource: require('../../../assets/avatars/ahmed.jpg'),
      },
      player2: null,
    },
    {
      player1: {
        firstName: 'Leo',
        lastName: 'Miguele',
        avatarSource: require('../../../assets/avatars/leo.jpg'),
      },
      player2: {
        firstName: 'Abdullah',
        lastName: 'Gaber',
        avatarSource: require('../../../assets/avatars/alex.jpg'),
      },
    },
    {
      player1: {
        firstName: 'Oorgive',
        lastName: 'Santene',
        avatarSource: require('../../../assets/avatars/omar.jpg'),
      },
      player2: null,
    },
    {
      player1: {
        firstName: 'Mitch',
        lastName: 'Mogul',
        avatarSource: require('../../../assets/avatars/chris.jpg'),
      },
      player2: {
        firstName: 'Alan',
        lastName: 'Faynne',
        avatarSource: require('../../../assets/avatars/jack.jpg'),
      },
    },
    {
      player1: {
        firstName: 'Karim',
        lastName: 'Omar',
        avatarSource: require('../../../assets/avatars/karim.jpg'),
      },
      player2: null,
    },
    {
      player1: null,
      player2: null,
    },
    {
      player1: null,
      player2: null,
    },
    {
      player1: null,
      player2: null,
    },
  ];

  const handleJoinTeam = (teamIndex) => {
    // Check if user has already joined a team
    if (currentUserHasTeam || userHasTeam) {
      // User already has a team - show share to invite others
      handleShare();
    } else {
      // User hasn't joined yet - open bottom sheet to join this team
      const team = teams[teamIndex];
      if (!isAuthenticated) {
        // Pass the action to execute after auth
        onAuthRequired && onAuthRequired(() => {
          setSelectedTeam(team);
          setShowJoinTeamSheet(true);
        });
        return;
      }
      setSelectedTeam(team);
      setShowJoinTeamSheet(true);
    }
  };

  const handleCreateTeam = () => {
    // Check if user is authenticated first
    if (!isAuthenticated) {
      // Pass the action to execute after auth
      onAuthRequired && onAuthRequired(() => {
        setShowCreateTeamSheet(true);
      });
      return;
    }

    setShowCreateTeamSheet(true);
  };

  const handleConfirmCreateTeam = async () => {
    if (!tournament?.id || !userData) {
      showToast('Cannot create team. Missing tournament or user data.', 'error');
      return;
    }

    try {
      // Get current teams or create empty array
      const currentTeams = tournament.teams || [];

      // Create new team with current user as player1
      const player1Data = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        userId: userData.uid,
      };

      // Only add avatarSource if it exists (avoid null/undefined in Firestore)
      if (userData.avatarUri) {
        player1Data.avatarSource = { uri: userData.avatarUri };
      }

      const newTeam = {
        player1: player1Data,
        player2: null,
        isAdminTeam: isAdmin,
      };

      // Add new team to teams array
      const updatedTeams = [...currentTeams, newTeam];

      // Update tournament in Firebase
      await updateTournament(tournament.id, {
        teams: updatedTeams,
      });

      console.log('Team created successfully!');
      setUserHasTeam(true);
      setShowCreateTeamSheet(false);
    } catch (error) {
      console.error('Error creating team:', error);
      showToast('Failed to create team. Please try again.', 'error');
    }
  };

  const handleConfirmJoinTeam = async () => {
    if (!tournament?.id || !userData || !selectedTeam) {
      showToast('Cannot join team. Missing required data.', 'error');
      return;
    }

    try {
      // Get current teams
      const currentTeams = tournament.teams || [];

      // Find the index of the selected team
      const teamIndex = currentTeams.findIndex(
        team => team.player1?.userId === selectedTeam.player1?.userId
      );

      if (teamIndex === -1) {
        showToast('Team not found.', 'error');
        return;
      }

      // Update the team with current user as player2
      const updatedTeams = [...currentTeams];
      const player2Data = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        userId: userData.uid,
      };

      // Only add avatarSource if it exists (avoid null/undefined in Firestore)
      if (userData.avatarUri) {
        player2Data.avatarSource = { uri: userData.avatarUri };
      }

      updatedTeams[teamIndex] = {
        ...updatedTeams[teamIndex],
        player2: player2Data,
      };

      // Update tournament in Firebase
      await updateTournament(tournament.id, {
        teams: updatedTeams,
      });

      // Send notification
      // Notification: Teammate Joined (to player1) - kept per requirements
      await createNotification(selectedTeam.player1.userId, {
        type: 'team',
        action: 'teammate_joined',
        title: 'Teammate Joined',
        message: `${userData.firstName} ${userData.lastName} joined your team in tournament: ${tournament.name}`,
        metadata: {
          tournamentId: tournament.id,
          tournamentName: tournament.name,
        },
        playerInfo: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatarUri: userData.avatarUri,
        },
      });

      // Notification "you_joined_team" removed per requirements

      console.log('Joined team successfully!');
      setUserHasTeam(true);
      setShowJoinTeamSheet(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error('Error joining team:', error);
      showToast('Failed to join team. Please try again.', 'error');
    }
  };

  const handleEditTournament = () => {
    console.log('🔧 Edit tournament clicked', { tournamentId: tournament?.id, activeTab });

    if (!tournament?.id) {
      showToast('Cannot edit this tournament. Tournament ID is missing.', 'error');
      return;
    }

    console.log('🔧 Setting showEditModal to true');
    // Ensure options sheet is fully closed before opening edit modal
    setShowOptionsSheet(false);
    setTimeout(() => {
      setShowEditModal(true);
      console.log('🔧 Modal state set to true');
    }, 400);
  };

  const handleTournamentUpdated = (updatedTournament) => {
    // The tournament context has already been updated
    // Just close the modal - the UI will re-render with new data
    console.log('Tournament updated:', updatedTournament);
  };

  const generateGroups = (teams) => {
    const teamCount = teams.length;
    const groupSize = teamCount >= 8 ? 4 : 3;
    const numberOfGroups = Math.ceil(teamCount / groupSize);

    // Shuffle teams randomly for fair distribution
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

    // Divide into groups
    const groups = [];
    for (let i = 0; i < numberOfGroups; i++) {
      groups.push({
        id: `group-${i + 1}`,
        name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
        teams: shuffledTeams.slice(i * groupSize, (i + 1) * groupSize),
      });
    }

    return groups;
  };

  const handleStartTournament = () => {
    setShowStartTournamentSheet(true);
  };

  const handleGenerateGroups = async () => {
    try {
      // Simulate generation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate groups from tournament teams
      const teams = generateTeams();
      const groups = generateGroups(teams);

      setGeneratedGroups(groups);
    } catch (error) {
      showToast('Failed to generate groups. Please try again.', 'error');
      throw error; // Re-throw so modal can handle the error state
    }
  };

  const generateMatches = (groups) => {
    let matchId = 1;
    const allMatches = [];

    // Parse available courts from tournament.courts string
    const courtNames = tournament.courts
      ? parseCourts(tournament.courts)
      : ['Court 1'];

    // First, collect all matches organized by round number
    const matchesByRound = {}; // { 1: [matches], 2: [matches], 3: [matches] }

    // Generate round-robin matches for each group
    groups.forEach(group => {
      const teams = group.teams;

      // Ensure we have at least 3 teams
      if (!teams || teams.length < 3) {
        console.warn(`Group ${group.name} has less than 3 teams, skipping match generation`);
        return;
      }

      // Determine round-robin pattern based on group size
      let rounds;

      if (teams.length === 3) {
        // Round-robin algorithm for 3 teams
        rounds = [
          [[0, 1]],       // Round 1
          [[0, 2]],       // Round 2
          [[1, 2]],       // Round 3
        ];
      } else if (teams.length === 4) {
        // Round-robin algorithm for 4 teams
        rounds = [
          [[0, 1], [2, 3]], // Round 1
          [[0, 2], [1, 3]], // Round 2
          [[0, 3], [1, 2]], // Round 3
        ];
      } else {
        console.warn(`Group ${group.name} has ${teams.length} teams, not supported yet`);
        return;
      }

      rounds.forEach((roundMatches, roundIndex) => {
        const roundNumber = roundIndex + 1;

        // Initialize array for this round if not exists
        if (!matchesByRound[roundNumber]) {
          matchesByRound[roundNumber] = [];
        }

        // Create unscheduled matches for this round
        roundMatches.forEach((matchPair) => {
          const [team1Index, team2Index] = matchPair;
          const team1 = teams[team1Index];
          const team2 = teams[team2Index];

          // Validate teams exist and have players
          if (!team1 || !team2 || !team1.player1 || !team1.player2 || !team2.player1 || !team2.player2) {
            console.warn(`Incomplete team data for match ${matchId}, skipping`);
            return;
          }

          matchesByRound[roundNumber].push({
            id: `match-${matchId}`,
            round: roundNumber,
            groupId: group.id,
            groupName: group.name,
            team1: team1,
            team2: team2,
            location: tournament.location,
            tournamentName: tournament.name,
            status: 'GROUP STAGE',
            score: null,
          });

          matchId++;
        });
      });
    });

    // Now schedule all matches round by round
    // This ensures matches from different groups in the same round get different courts
    const baseDateTime = new Date(tournament.dateTime);

    Object.keys(matchesByRound).sort((a, b) => a - b).forEach((roundNumber) => {
      const roundMatches = matchesByRound[roundNumber];
      const roundIndex = parseInt(roundNumber) - 1;

      // Calculate start time for this round
      // Each round is offset by match duration + buffer time
      const roundOffset = roundIndex * (30 + 15); // 30 min match + 15 min buffer
      const roundStartTime = new Date(baseDateTime.getTime() + roundOffset * 60000);

      // Schedule ALL matches for this round together
      // This allows proper court distribution across groups
      const scheduledRoundMatches = scheduleMatches(
        roundMatches,
        courtNames,
        roundStartTime,
        30, // Match duration: 30 minutes
        15  // Buffer time: 15 minutes
      );

      allMatches.push(...scheduledRoundMatches);
    });

    return allMatches;
  };

  const handleConfirmAndStartTournament = () => {
    try {
      // Generate matches from groups
      const matches = generateMatches(generatedGroups);

      console.log('Generated matches:', matches.length);
      console.log('Tournament ID:', tournament.id);
      console.log('Update function exists:', typeof updateTournament);

      if (generatedGroups && generatedGroups.length > 0) {
        console.log('Generated groups count:', generatedGroups.length);
        console.log('First group:', generatedGroups[0]);
        if (generatedGroups[0]?.teams) {
          console.log('First group teams count:', generatedGroups[0].teams.length);
          console.log('First team:', generatedGroups[0].teams[0]);
        }
      }

      // Update tournament with groups, matches, and new status
      console.log('About to update tournament...');
      try {
        updateTournament(tournament.id, {
          status: 'GROUP STAGE',
          groups: generatedGroups,
          matches: matches,
        });
        console.log('Tournament updated successfully');
      } catch (updateError) {
        console.error('Error during updateTournament:', updateError);
        throw updateError;
      }

      console.log('Closing modal...');
      setShowStartTournamentSheet(false);
      console.log('Showing toast...');
      showToast(`Tournament started! ${matches.length} group stage matches have been created.`, 'success');
    } catch (error) {
      console.error('Error starting tournament:', error);
      showToast(`Failed to start tournament: ${error.message}`, 'error');
    }
  };

  const handleRegenerateGroups = async () => {
    try {
      // Simulate generation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Regenerate groups with new random shuffle
      const teams = generateTeams();
      const newGroups = generateGroups(teams);
      setGeneratedGroups(newGroups);
    } catch (error) {
      showToast('Failed to regenerate groups. Please try again.', 'error');
      throw error; // Re-throw so modal can handle the error state
    }
  };

  // Helper function to check if a match involves the current user
  const isUserMatch = (match) => {
    if (!userData?.uid || !match) return false;
    if (!match.team1 || !match.team2) return false;
    const team1HasUser = match.team1?.player1?.userId === userData.uid || match.team1?.player2?.userId === userData.uid;
    const team2HasUser = match.team2?.player1?.userId === userData.uid || match.team2?.player2?.userId === userData.uid;
    return team1HasUser || team2HasUser;
  };

  // Check if current user can record/edit score for a match
  const canRecordScore = (match) => {
    // Tournament host can record any match score
    if (isAdmin) return true;

    // Players can only record their own match scores
    if (isUserMatch(match)) return true;

    // Everyone else cannot record scores
    return false;
  };

  // Get user's group ID
  const getUserGroupId = () => {
    if (!tournament.groups || !userData?.uid) return null;
    for (const group of tournament.groups) {
      if (!group.teams || !Array.isArray(group.teams)) continue;
      const hasUser = group.teams.some(team =>
        team && (team.player1?.userId === userData.uid || team.player2?.userId === userData.uid)
      );
      if (hasUser) return group.id;
    }
    return null;
  };

  // Toggle round expansion
  const toggleRound = (roundNumber) => {
    setExpandedRounds(prev => ({
      ...prev,
      [roundNumber]: !prev[roundNumber],
    }));
  };

  // Get selected group for a round (default to user's group or first group)
  const getSelectedGroup = (roundNumber) => {
    if (selectedGroupPerRound[roundNumber]) {
      return selectedGroupPerRound[roundNumber];
    }
    // Default to user's group or first group
    const userGroupId = getUserGroupId();
    return userGroupId || tournament.groups?.[0]?.id || null;
  };

  // Set selected group for a round
  const setSelectedGroup = (roundNumber, groupId) => {
    setSelectedGroupPerRound(prev => ({
      ...prev,
      [roundNumber]: groupId,
    }));
  };

  const handleDeleteTournament = () => {
    Alert.alert(
      'Delete Tournament',
      'Are you sure you want to delete this tournament? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (tournament.id) {
              deleteTournament(tournament.id);
              navigation.goBack(); // Navigate back after deletion
            }
          },
        },
      ]
    );
  };

  // TESTING ONLY: Fill tournament with dummy teams
  const handleFillWithDummyData = async () => {
    if (!tournament?.id) {
      showToast('Cannot fill tournament. Tournament ID is missing.', 'error');
      return;
    }

    try {
      const dummyPlayers = [
        { firstName: 'Ahmed', lastName: 'Basyouni' },
        { firstName: 'Leo', lastName: 'Miguele' },
        { firstName: 'Abdullah', lastName: 'Gaber' },
        { firstName: 'Oorgive', lastName: 'Santene' },
        { firstName: 'Mitch', lastName: 'Mogul' },
        { firstName: 'Alan', lastName: 'Faynne' },
        { firstName: 'Karim', lastName: 'Omar' },
        { firstName: 'Chris', lastName: 'Johnson' },
        { firstName: 'Jack', lastName: 'Smith' },
        { firstName: 'Omar', lastName: 'Ali' },
        { firstName: 'Sarah', lastName: 'Williams' },
        { firstName: 'Emma', lastName: 'Brown' },
        { firstName: 'Michael', lastName: 'Davis' },
        { firstName: 'Sophia', lastName: 'Miller' },
        { firstName: 'James', lastName: 'Wilson' },
        { firstName: 'Olivia', lastName: 'Moore' },
      ];

      const currentTeams = tournament.teams || [];
      const teamCount = tournament.teamCount || 8;
      let playerIndex = 0;

      // First, fill incomplete teams (teams with player1 but no player2)
      const updatedCurrentTeams = currentTeams.map(team => {
        if (team.player1 && !team.player2) {
          // Fill player2 spot with dummy data
          return {
            ...team,
            player2: {
              firstName: dummyPlayers[playerIndex % dummyPlayers.length].firstName,
              lastName: dummyPlayers[playerIndex % dummyPlayers.length].lastName,
              userId: `dummy-${playerIndex}`,
            },
          };
          playerIndex++;
        }
        return team;
      });

      // Calculate how many new teams we need
      const neededTeams = teamCount - updatedCurrentTeams.length;

      if (neededTeams <= 0 && updatedCurrentTeams.every(t => t.player1 && t.player2)) {
        showToast('Tournament is already full!', 'error');
        return;
      }

      // Create new complete teams for remaining spots
      const newTeams = [];
      for (let i = 0; i < neededTeams; i++) {
        newTeams.push({
          player1: {
            firstName: dummyPlayers[playerIndex % dummyPlayers.length].firstName,
            lastName: dummyPlayers[playerIndex % dummyPlayers.length].lastName,
            userId: `dummy-${playerIndex}`,
          },
          player2: {
            firstName: dummyPlayers[(playerIndex + 1) % dummyPlayers.length].firstName,
            lastName: dummyPlayers[(playerIndex + 1) % dummyPlayers.length].lastName,
            userId: `dummy-${playerIndex + 1}`,
          },
          isAdminTeam: false,
        });
        playerIndex += 2;
      }

      await updateTournament(tournament.id, {
        teams: [...updatedCurrentTeams, ...newTeams],
      });

      showToast('Tournament filled with dummy teams!', 'success');
    } catch (error) {
      console.error('Error filling tournament:', error);
      showToast('Failed to fill tournament with dummy data.', 'error');
    }
  };

  const isMatchPast = (match) => {
    if (!match.dateTime) return false;
    const matchDate = new Date(match.dateTime);
    const now = new Date();
    return matchDate < now;
  };

  const handleAddScore = (match) => {
    // Check permissions before allowing score recording
    if (!canRecordScore(match)) {
      showToast('You do not have permission to record this score', 'error');
      return;
    }

    setSelectedMatch(match);
    setShowRecordScoreModal(true);
  };

  const handleSaveScore = async (scores) => {
    if (!selectedMatch || !tournament?.id) return;

    try {
      // Calculate winning team by counting sets won
      let teamAWins = 0;
      let teamBWins = 0;

      scores.forEach(set => {
        const scoreA = parseInt(set.teamA);
        const scoreB = parseInt(set.teamB);
        if (scoreA > scoreB) {
          teamAWins++;
        } else if (scoreB > scoreA) {
          teamBWins++;
        }
      });

      const winningTeam = teamAWins > teamBWins ? 'left' : 'right';

      // Update the match in the tournament's matches array
      // Filter out undefined values to avoid Firestore errors
      const updatedMatches = tournament.matches.map(m => {
        if (m.id === selectedMatch.id) {
          const updatedMatch = { ...m, score: scores, scoreRecorded: true, winningTeam };
          // Remove any undefined fields
          Object.keys(updatedMatch).forEach(key => {
            if (updatedMatch[key] === undefined) {
              delete updatedMatch[key];
            }
          });
          return updatedMatch;
        }
        return m;
      });

      await updateTournament(tournament.id, {
        matches: updatedMatches,
      });

      // Determine if this is adding or updating a score
      const isUpdating = selectedMatch.scoreRecorded === true;
      const action = isUpdating ? 'score_updated' : 'score_added';
      const actionText = isUpdating ? 'updated' : 'added';

      // Get all 4 players in the match
      const playerIds = [
        selectedMatch.team1?.player1?.userId,
        selectedMatch.team1?.player2?.userId,
        selectedMatch.team2?.player1?.userId,
        selectedMatch.team2?.player2?.userId,
      ].filter(id => id && id !== userData?.uid); // Exclude the current user

      // Send notifications to all players in the match (except the one who recorded the score)
      if (playerIds.length > 0 && userData) {
        await createNotificationsForUsers(playerIds, {
          type: 'match',
          action,
          title: isUpdating ? 'Score Updated' : 'Score Added',
          message: `${userData.firstName} ${userData.lastName} ${actionText} score to your recent match.`,
          metadata: {
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            matchId: selectedMatch.id,
          },
          playerInfo: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatarUri: userData.avatarUri,
          },
        });
      }

      showToast('Score recorded successfully!', 'success');
      setShowRecordScoreModal(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error saving score:', error);
      showToast('Failed to save score. Please try again.', 'error');
    }
  };

  // Debug: Log userData to see what we're working with
  console.log('TournamentDetailsScreen - userData:', userData);
  console.log('TournamentDetailsScreen - isAuthenticated:', isAuthenticated);
  console.log('TournamentDetailsScreen - userData.avatarUri:', userData?.avatarUri);
  console.log('TournamentDetailsScreen - userData.firstName:', userData?.firstName);
  console.log('TournamentDetailsScreen - userData.lastName:', userData?.lastName);

  const currentUser = {
    displayName: userData ? `${userData.firstName} ${userData.lastName}` : 'User',
    profilePhoto: userData?.avatarUri ? { uri: userData.avatarUri } : null,
  };

  console.log('TournamentDetailsScreen - currentUser:', currentUser);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft width={32} height={32} color={Colors.primary300} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Tournament details</Text>

          {/* Show three dots for host, share icon for others */}
          {isAdmin ? (
            <TouchableOpacity
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => setShowOptionsSheet(true)}
            >
              <MoreIcon width={32} height={32} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={handleShare}
            >
              <ShareIcon width={28} height={28} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 56 + Spacing.space4,
            paddingBottom: 80 + Spacing.space4
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Tournament Title */}
        <Text style={styles.tournamentTitle}>
          {tournament.name}
        </Text>

        {/* Status Badge */}
        <Badge
          variant={tournament.status}
          label={tournament.status}
          style={styles.badgeMargin}
        />

        {/* Tab Selector - Only show for non-registration stages */}
        {tournament.status !== 'REGISTRATION' && (
          <TabSelector
            tabs={['Details', 'Matches']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
          />
        )}

        {/* Content based on active tab and status */}
        {activeTab === 'Details' && (
          <>
            {/* Tournament Info Card */}
            <Card style={styles.infoCard}>
              <View style={styles.infoContainer}>
                <DetailsListItem
                  icon={<LocationIcon width={24} height={24} />}
                  text={tournament.location}
                />

                <DetailsListItem
                  icon={<BallIcon width={24} height={24} />}
                  text={
                    tournament.courts
                      ? (() => {
                          const courts = parseCourts(tournament.courts);
                          const courtNumbers = courts.map(court => court.replace(/Court\s*/i, ''));
                          const formattedCourts = courtNumbers.length > 1
                            ? courtNumbers.slice(0, -1).join(', ') + ' & ' + courtNumbers[courtNumbers.length - 1]
                            : courtNumbers[0];
                          return `Courts: ${formattedCourts}`;
                        })()
                      : 'Courts not specified'
                  }
                />

                <DetailsListItem
                  icon={<CalendarIcon width={24} height={24} />}
                  text={tournamentDateTime}
                />

                <DetailsListItem
                  icon={<CompeteIcon width={24} height={24} />}
                  text={tournament.format}
                  actionIcon={<InfoIcon width={20} height={20} />}
                  onActionPress={() => setShowFormatInfoSheet(true)}
                />

                <DetailsListItem
                  icon={<TeamIcon width={24} height={24} />}
                  text={`${tournament.teamCount} Teams`}
                />
              </View>
            </Card>

            {/* Rules Section */}
            <Card style={styles.rulesCard}>
              <View style={styles.rulesWrapper}>
                <TouchableOpacity
                  style={styles.rulesHeader}
                  onPress={() => setRulesExpanded(!rulesExpanded)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rulesHeaderLeft}>
                    <RulesIcon width={24} height={24} />
                    <Text style={styles.rulesText}>Rules</Text>
                  </View>
                  <View style={[
                    styles.chevronIcon,
                    rulesExpanded && styles.chevronIconExpanded
                  ]}>
                    <ChevronDownIcon width={24} height={24} />
                  </View>
                </TouchableOpacity>

                {tournament.rules && rulesExpanded && (
                  <Animated.View
                    style={[
                      styles.rulesContent,
                      {
                        maxHeight: animatedHeight.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 500],
                        }),
                        opacity: animatedHeight,
                        overflow: 'hidden',
                      },
                    ]}
                  >
                    <Text style={styles.rulesContentText}>{tournament.rules}</Text>
                  </Animated.View>
                )}
              </View>
            </Card>

            {/* Show Groups if in GROUP STAGE, otherwise show Teams List */}
            {tournament.status === 'GROUP STAGE' && tournament.groups && Array.isArray(tournament.groups) ? (
              <>
                {console.log('Rendering groups:', tournament.groups.length)}
                {tournament.groups.map((group, index) => (
                  <View key={group.id} style={styles.groupSection}>
                    <Text style={styles.groupTitle}>{group.name}</Text>
                    <View style={styles.groupTeamsContainer}>
                      {console.log(`Group ${group.name} teams:`, group.teams?.length)}
                      {(group.teams && Array.isArray(group.teams) ? group.teams : [])
                        .filter(team => team && team.player1 && team.player2)
                        .map((team, teamIndex) => (
                          <View key={teamIndex} style={styles.teamItem}>
                            <Player
                              firstName={team.player1.firstName}
                              lastName={team.player1.lastName}
                              avatarSource={team.player1.avatarSource}
                              align="left"
                            />
                            <Player
                              firstName={team.player2.firstName}
                              lastName={team.player2.lastName}
                              avatarSource={team.player2.avatarSource}
                              align="right"
                            />
                          </View>
                        ))}
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <TeamsList
                teams={teams}
                totalTeams={tournament.teamCount}
                onJoinTeam={handleJoinTeam}
                onCreateTeam={handleCreateTeam}
                userHasTeam={currentUserHasTeam || userHasTeam}
                isAdmin={isAdmin}
                currentUserId={userData?.uid}
                onStartTournament={handleStartTournament}
              />
            )}
          </>
        )}

        {/* Matches Tab Content */}
        {activeTab === 'Matches' && tournament.status === 'GROUP STAGE' && tournament.matches && (
          <View style={styles.matchesContainer}>
            {console.log('Tournament matches count:', tournament.matches.length)}
            {console.log('First match:', tournament.matches[0])}
            {/* Round 1 */}
            <View style={styles.roundSection}>
              <TouchableOpacity
                style={styles.roundHeader}
                onPress={() => toggleRound(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.roundTitle}>Round 1</Text>
                <View style={[
                  styles.roundChevron,
                  !expandedRounds[1] && styles.roundChevronCollapsed
                ]}>
                  <ChevronDownIcon width={24} height={24} />
                </View>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.roundContent,
                  {
                    maxHeight: roundAnimations[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 2000],
                    }),
                    opacity: roundAnimations[1],
                    overflow: 'hidden',
                  },
                ]}
              >
                  {/* Group Filter Chips */}
                  {tournament.groups && tournament.groups.length > 1 && (
                    <FilterChips
                      chips={tournament.groups.map(g => g.name)}
                      activeChip={tournament.groups.find(g => g.id === getSelectedGroup(1))?.name || tournament.groups[0].name}
                      onChipPress={(groupName) => {
                        const group = tournament.groups.find(g => g.name === groupName);
                        if (group) setSelectedGroup(1, group.id);
                      }}
                    />
                  )}

                  {/* Match Cards for Round 1 */}
                  <View style={styles.matchesList}>
                    {tournament.matches
                      .filter(match => {
                        console.log('Filtering Round 1 match:', match.id, 'has team1?', !!match.team1, 'has team2?', !!match.team2);
                        return match.round === 1 && match.groupId === getSelectedGroup(1);
                      })
                      .filter(match => {
                        const isValid = match.team1 && match.team2 && match.team1.player1 && match.team2.player1;
                        if (!isValid) {
                          console.warn('Invalid match filtered out:', match.id);
                        }
                        return isValid;
                      })
                      .map(match => {
                        console.log('Rendering match:', match.id);
                        return (
                        <MatchCard
                          key={match.id}
                          leftTeam={{
                            player1: match.team1.player1,
                            player2: match.team1.player2,
                          }}
                          rightTeam={{
                            player1: match.team2.player1,
                            player2: match.team2.player2,
                          }}
                          location={match.location}
                          court={match.court}
                          dateTime={match.dateTime}
                          status={match.status}
                          score={match.score}
                          scoreRecorded={match.scoreRecorded || false}
                          isPast={isMatchPast(match)}
                          onAddScore={() => handleAddScore(match)}
                          canRecord={canRecordScore(match)}
                          highlightBorder={isUserMatch(match)}
                          onPress={() => {
                            // Transform match data to match MatchDetailsScreen expectations
                            const transformedMatch = {
                              ...match,
                              leftTeam: {
                                player1: match.team1.player1,
                                player2: match.team1.player2,
                              },
                              rightTeam: {
                                player1: match.team2.player1,
                                player2: match.team2.player2,
                              },
                              isPast: isMatchPast(match),
                              tournamentId: tournament?.id,
                            };
                            navigation.navigate('MatchDetails', { match: transformedMatch });
                          }}
                        />
                      );
                      })}
                  </View>
              </Animated.View>
            </View>

            {/* Divider */}
            <View style={styles.roundDivider} />

            {/* Round 2 */}
            <View style={styles.roundSection}>
              <TouchableOpacity
                style={styles.roundHeader}
                onPress={() => toggleRound(2)}
                activeOpacity={0.7}
              >
                <Text style={styles.roundTitle}>Round 2</Text>
                <View style={[
                  styles.roundChevron,
                  !expandedRounds[2] && styles.roundChevronCollapsed
                ]}>
                  <ChevronDownIcon width={24} height={24} />
                </View>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.roundContent,
                  {
                    maxHeight: roundAnimations[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 2000],
                    }),
                    opacity: roundAnimations[2],
                    overflow: 'hidden',
                  },
                ]}
              >
                  {/* Group Filter Chips */}
                  {tournament.groups && tournament.groups.length > 1 && (
                    <FilterChips
                      chips={tournament.groups.map(g => g.name)}
                      activeChip={tournament.groups.find(g => g.id === getSelectedGroup(2))?.name || tournament.groups[0].name}
                      onChipPress={(groupName) => {
                        const group = tournament.groups.find(g => g.name === groupName);
                        if (group) setSelectedGroup(2, group.id);
                      }}
                    />
                  )}

                  {/* Match Cards for Round 2 */}
                  <View style={styles.matchesList}>
                    {tournament.matches
                      .filter(match => match.round === 2 && match.groupId === getSelectedGroup(2))
                      .filter(match => match.team1 && match.team2 && match.team1.player1 && match.team2.player1)
                      .map(match => (
                        <MatchCard
                          key={match.id}
                          leftTeam={{
                            player1: match.team1.player1,
                            player2: match.team1.player2,
                          }}
                          rightTeam={{
                            player1: match.team2.player1,
                            player2: match.team2.player2,
                          }}
                          location={match.location}
                          court={match.court}
                          dateTime={match.dateTime}
                          status={match.status}
                          score={match.score}
                          scoreRecorded={match.scoreRecorded || false}
                          isPast={isMatchPast(match)}
                          onAddScore={() => handleAddScore(match)}
                          canRecord={canRecordScore(match)}
                          highlightBorder={isUserMatch(match)}
                          onPress={() => {
                            // Transform match data to match MatchDetailsScreen expectations
                            const transformedMatch = {
                              ...match,
                              leftTeam: {
                                player1: match.team1.player1,
                                player2: match.team1.player2,
                              },
                              rightTeam: {
                                player1: match.team2.player1,
                                player2: match.team2.player2,
                              },
                              isPast: isMatchPast(match),
                              tournamentId: tournament?.id,
                            };
                            navigation.navigate('MatchDetails', { match: transformedMatch });
                          }}
                        />
                      ))}
                  </View>
              </Animated.View>
            </View>

            {/* Divider */}
            <View style={styles.roundDivider} />

            {/* Round 3 */}
            <View style={styles.roundSection}>
              <TouchableOpacity
                style={styles.roundHeader}
                onPress={() => toggleRound(3)}
                activeOpacity={0.7}
              >
                <Text style={styles.roundTitle}>Round 3</Text>
                <View style={[
                  styles.roundChevron,
                  !expandedRounds[3] && styles.roundChevronCollapsed
                ]}>
                  <ChevronDownIcon width={24} height={24} />
                </View>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.roundContent,
                  {
                    maxHeight: roundAnimations[3].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 2000],
                    }),
                    opacity: roundAnimations[3],
                    overflow: 'hidden',
                  },
                ]}
              >
                  {/* Group Filter Chips */}
                  {tournament.groups && tournament.groups.length > 1 && (
                    <FilterChips
                      chips={tournament.groups.map(g => g.name)}
                      activeChip={tournament.groups.find(g => g.id === getSelectedGroup(3))?.name || tournament.groups[0].name}
                      onChipPress={(groupName) => {
                        const group = tournament.groups.find(g => g.name === groupName);
                        if (group) setSelectedGroup(3, group.id);
                      }}
                    />
                  )}

                  {/* Match Cards for Round 3 */}
                  <View style={styles.matchesList}>
                    {tournament.matches
                      .filter(match => match.round === 3 && match.groupId === getSelectedGroup(3))
                      .filter(match => match.team1 && match.team2 && match.team1.player1 && match.team2.player1)
                      .map(match => (
                        <MatchCard
                          key={match.id}
                          leftTeam={{
                            player1: match.team1.player1,
                            player2: match.team1.player2,
                          }}
                          rightTeam={{
                            player1: match.team2.player1,
                            player2: match.team2.player2,
                          }}
                          location={match.location}
                          court={match.court}
                          dateTime={match.dateTime}
                          status={match.status}
                          score={match.score}
                          scoreRecorded={match.scoreRecorded || false}
                          isPast={isMatchPast(match)}
                          onAddScore={() => handleAddScore(match)}
                          canRecord={canRecordScore(match)}
                          highlightBorder={isUserMatch(match)}
                          onPress={() => {
                            // Transform match data to match MatchDetailsScreen expectations
                            const transformedMatch = {
                              ...match,
                              leftTeam: {
                                player1: match.team1.player1,
                                player2: match.team1.player2,
                              },
                              rightTeam: {
                                player1: match.team2.player1,
                                player2: match.team2.player2,
                              },
                              isPast: isMatchPast(match),
                              tournamentId: tournament?.id,
                            };
                            navigation.navigate('MatchDetails', { match: transformedMatch });
                          }}
                        />
                      ))}
                  </View>
              </Animated.View>
            </View>

            {/* Divider */}
            <View style={styles.roundDivider} />

            {/* Knock out */}
            <View style={styles.roundSection}>
              <TouchableOpacity
                style={styles.roundHeader}
                onPress={() => toggleRound(4)}
                activeOpacity={0.7}
              >
                <Text style={styles.roundTitle}>Knock out</Text>
                <View style={[
                  styles.roundChevron,
                  !expandedRounds[4] && styles.roundChevronCollapsed
                ]}>
                  <ChevronDownIcon width={24} height={24} />
                </View>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.roundContent,
                  {
                    maxHeight: roundAnimations[4].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 200],
                    }),
                    opacity: roundAnimations[4],
                    overflow: 'hidden',
                  },
                ]}
              >
                  <Text style={styles.tbdText}>TBD</Text>
              </Animated.View>
            </View>

            {/* Divider */}
            <View style={styles.roundDivider} />

            {/* Finals */}
            <View style={styles.roundSection}>
              <TouchableOpacity
                style={styles.roundHeader}
                onPress={() => toggleRound(5)}
                activeOpacity={0.7}
              >
                <Text style={styles.roundTitle}>Finals</Text>
                <View style={[
                  styles.roundChevron,
                  !expandedRounds[5] && styles.roundChevronCollapsed
                ]}>
                  <ChevronDownIcon width={24} height={24} />
                </View>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.roundContent,
                  {
                    maxHeight: roundAnimations[5].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 200],
                    }),
                    opacity: roundAnimations[5],
                    overflow: 'hidden',
                  },
                ]}
              >
                  <Text style={styles.tbdText}>TBD</Text>
              </Animated.View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Button - Only show during REGISTRATION phase */}
      {tournament.status === 'REGISTRATION' && (
        <>
          {isTournamentFull ? (
            /* Tournament is full - only show Start button for admin */
            isAdmin ? (
              <View style={styles.stickyButtonContainer}>
                <Button
                  title="Start tournament"
                  onPress={handleStartTournament}
                  variant="primary"
                  fullWidth={true}
                />
              </View>
            ) : null
          ) : (
            /* Tournament is not full - show Share or Join button */
            <View style={styles.stickyButtonContainer}>
              <Button
                title={
                  isAdmin || currentUserHasTeam || userHasTeam
                    ? "Share with friends"
                    : "Join tournament"
                }
                onPress={
                  isAdmin || currentUserHasTeam || userHasTeam
                    ? handleShare
                    : handleJoinTournament
                }
                variant="primary"
                fullWidth={true}
              />
            </View>
          )}
        </>
      )}

      {/* Create Team Bottom Sheet */}
      <CreateTeamBottomSheet
        visible={showCreateTeamSheet}
        onClose={() => setShowCreateTeamSheet(false)}
        onConfirm={handleConfirmCreateTeam}
        currentUser={currentUser}
      />

      {/* Join Team Bottom Sheet */}
      <JoinTeamBottomSheet
        visible={showJoinTeamSheet}
        onClose={() => {
          setShowJoinTeamSheet(false);
          setSelectedTeam(null);
        }}
        onConfirm={handleConfirmJoinTeam}
        teamPlayer={selectedTeam?.player1}
        currentUser={currentUser}
      />

      {/* Tournament Options Bottom Sheet (for hosts only) */}
      <TournamentOptionsBottomSheet
        visible={showOptionsSheet}
        onClose={() => setShowOptionsSheet(false)}
        onEdit={handleEditTournament}
        onDelete={handleDeleteTournament}
        onFillDummyData={handleFillWithDummyData}
      />

      {/* Edit Tournament Modal */}
      <CreateTournamentModal
        key={`edit-modal-${tournament?.id}-${showEditModal}`}
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onTournamentCreated={handleTournamentUpdated}
        editMode={true}
        tournament={tournament}
      />

      {/* Start Tournament Bottom Sheet */}
      <StartTournamentBottomSheet
        visible={showStartTournamentSheet}
        onClose={() => setShowStartTournamentSheet(false)}
        onConfirm={handleConfirmAndStartTournament}
        onGenerateGroups={handleGenerateGroups}
        generatedGroups={generatedGroups}
        tournament={tournament}
      />

      <RecordScoreModal
        visible={showRecordScoreModal}
        onClose={() => {
          setShowRecordScoreModal(false);
          setSelectedMatch(null);
        }}
        match={selectedMatch}
        onSave={handleSaveScore}
      />

      {/* Format Info Bottom Sheet */}
      <Modal
        visible={showFormatInfoSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFormatInfoSheet(false)}
      >
        <SafeAreaView style={styles.formatInfoContainer} edges={['top']}>
          {/* Swipe Indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header with Close Button */}
          <View style={styles.formatInfoHeader}>
            <TouchableOpacity onPress={() => setShowFormatInfoSheet(false)} style={styles.headerButton}>
              <CloseIcon width={32} height={32} />
            </TouchableOpacity>
            <View style={styles.formatInfoHeaderTextContainer}>
              <Text style={styles.formatInfoTitle}>{tournament?.format || 'Format'}</Text>
            </View>
            <View style={styles.headerButton} />
          </View>

          {/* Content */}
          <ScrollView
            style={styles.formatInfoScrollView}
            contentContainerStyle={[styles.formatInfoScrollContent, { paddingBottom: insets.bottom + Spacing.space4 }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.formatInfoDescription}>
              {tournament?.format === 'World cup'
                ? 'The World Cup format divides all participating teams into groups of 4. Within each group, teams compete in a round-robin tournament where every team plays against each other exactly once, resulting in 3 matches per team in the group stage.\n\nAt the end of the group stage, teams are ranked based on their performance. The top 2 teams from each group advance to the knockout stage, while the remaining teams are eliminated.\n\nThe knockout stage follows a single-elimination bracket format. Winners from each match advance to the next round, while losers are eliminated. The tournament culminates in a final match between the two remaining teams to determine the champion.'
                : tournament?.formatDescription || 'No format description available.'}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 1000,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.space4,
  },
  tournamentTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline200,
    color: Colors.primary300,
    marginTop: Spacing.space2,
    marginBottom: Spacing.space2,
  },
  tournamentTitleNoTabs: {
    marginTop: 0,
  },
  badgeMargin: {
    marginBottom: Spacing.space4, // 16px spacing to tabs
  },
  infoCard: {
    marginBottom: Spacing.space1,
    padding: Spacing.space3,
  },
  infoContainer: {
    gap: Spacing.space2,
  },
  rulesCard: {
    marginBottom: Spacing.space4,
    padding: Spacing.space3,
  },
  rulesWrapper: {
    margin: -Spacing.space4,
    padding: Spacing.space4,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rulesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space2,
  },
  rulesText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  rulesContent: {
    paddingTop: Spacing.space2,
  },
  rulesContentText: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.5,
  },
  shareButtonContainer: {
    marginTop: Spacing.space4,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.space4,
    paddingBottom: Spacing.space4,
    backgroundColor: Colors.background,
  },
  groupSection: {
    marginBottom: Spacing.space4,
  },
  groupTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body300,
    color: Colors.primary300,
    marginBottom: Spacing.space2,
  },
  groupTeamsContainer: {
    gap: Spacing.space1,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.space3,
    minHeight: 64,
  },
  matchesContainer: {
    flex: 1,
  },
  roundSection: {
    marginBottom: Spacing.space2, // 8px gap between accordions
  },
  roundDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.space2, // 8px top padding only
  },
  roundTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
  },
  roundChevron: {
    transform: [{ rotate: '180deg' }],
  },
  roundChevronCollapsed: {
    transform: [{ rotate: '0deg' }],
  },
  roundContent: {
    paddingTop: Spacing.space2,
  },
  groupTabsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  groupTab: {
    flex: 1,
    paddingVertical: Spacing.space3,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  groupTabActive: {
    borderBottomColor: Colors.primary300,
  },
  groupTabText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral400,
  },
  groupTabTextActive: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  matchesList: {
    gap: Spacing.space2,
  },
  tbdText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral400,
    textAlign: 'center',
    paddingVertical: Spacing.space4,
  },
  // Format Info Bottom Sheet Styles
  formatInfoContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.space2,
    paddingBottom: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
  formatInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
    marginBottom: Spacing.space4,
  },
  formatInfoHeaderTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  formatInfoTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    textAlign: 'center',
  },
  formatInfoScrollView: {
    flex: 1,
  },
  formatInfoScrollContent: {
    paddingHorizontal: Spacing.space4,
  },
  formatInfoDescription: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.5,
  },
});
