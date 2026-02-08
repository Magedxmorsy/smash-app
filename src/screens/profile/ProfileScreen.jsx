import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { useAuth } from '../../contexts/AuthContext';
import { useTournaments } from '../../contexts/TournamentContext';
import { calculatePlayerStats } from '../../utils/statsCalculator';
import TournamentCard from '../../components/tournament/TournamentCard';
import MobileHeader from '../../components/ui/MobileHeader';
import TabSelector from '../../components/ui/TabSelector';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import LinkButton from '../../components/ui/LinkButton';
import EmptyState from '../../components/ui/EmptyState';
import EditProfileModal from '../../components/profile/EditProfileModal';
import Banner from '../../components/ui/Banner';
import SettingsIcon from '../../../assets/icons/settings.svg';

export default function ProfileScreen({ navigation, onCreateAccount }) {
  const { userData, isAuthenticated, isEmailVerified } = useAuth();
  const { tournaments: allTournaments, getHostedTournaments, getJoinedTournaments } = useTournaments();
  const [activeTab, setActiveTab] = useState('Hosted');
  const [showEditModal, setShowEditModal] = useState(false);

  // Refs for scroll position preservation
  const scrollViewRef = useRef(null);
  const currentScrollY = useRef(0);

  // Calculate real player stats from tournaments
  const playerStats = useMemo(() => {
    if (!userData?.uid || !allTournaments) {
      return {
        tournamentsPlayed: 0,
        trophiesWon: 0,
        matchesWon: 0,
        matchesPlayed: 0,
      };
    }
    return calculatePlayerStats(allTournaments, userData.uid);
  }, [allTournaments, userData?.uid]);

  const stats = [
    { label: 'Tournaments played', value: playerStats.tournamentsPlayed.toString() },
    { label: 'Trophies won', value: playerStats.trophiesWon.toString() },
    { label: 'Matches won', value: playerStats.matchesWon.toString() },
    { label: 'Matches played', value: playerStats.matchesPlayed.toString() },
  ];

  const hostedTournaments = getHostedTournaments();
  const joinedTournaments = getJoinedTournaments();

  const displayedTournaments = activeTab === 'Hosted' ? hostedTournaments : joinedTournaments;

  const handleTournamentPress = (tournament) => {
    navigation.navigate('TournamentDetails', {
      tournament,
      onAuthRequired: onCreateAccount,
    });
  };

  // Handle create tournament button
  const handleCreateTournament = () => {
    navigation.navigate('CreateTournamentModal', {
      editMode: false,
    });
  };

  // Handle tab change with scroll position preservation
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);

    // Restore scroll position after tab content changes
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      if (scrollViewRef.current && currentScrollY.current > 0) {
        scrollViewRef.current.scrollTo({
          y: currentScrollY.current,
          animated: false,
        });
      }
    });
  };

  // Track scroll position
  const handleScroll = (event) => {
    currentScrollY.current = event.nativeEvent.contentOffset.y;
  };

  // Empty state for non-authenticated users
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <MobileHeader
          title="Profile"
          rightIcon={false}
        />

        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateContent}>
            <Image
              source={require('../../../assets/noplayer.png')}
              style={styles.emptyStateImage}
            />

            <Text style={styles.emptyStateTitle}>No profile yet</Text>
            <Text style={styles.emptyStateDescription}>
              Login or create an account to track your tournaments, stats, and compete with friends
            </Text>

            <Button
              title="Login or sign up"
              onPress={onCreateAccount}
              variant="primary"
              fullWidth={false}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MobileHeader
        title="Profile"
        rightIcon={true}
        RightIconComponent={SettingsIcon}
        onRightPress={() => navigation.navigate('Settings')}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + Spacing.space4 }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >


        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar
              size="large"
              source={userData?.avatarUri}
              name={`${userData?.firstName || ''} ${userData?.lastName || ''}`}
            />
          </View>

          <Text style={styles.profileName}>
            {userData?.firstName} {userData?.lastName}
          </Text>

          <LinkButton
            title="Edit profile"
            onPress={() => setShowEditModal(true)}
            variant="neutral"
          />
        </View>

        {/* Email Verification Banner */}
        {!isEmailVerified && (
          <View style={styles.bannerContainer}>
            <Banner
              variant="warning"
              message="Verify your email. We sent a verification link to your email. Check your inbox."
              dismissible={false}
            />
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelectorContainer}>
          <TabSelector
            tabs={['Hosted', 'Joined']}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </View>

        {/* Tournaments List or Empty State */}
        <View style={styles.tournamentsSection}>
          {displayedTournaments.length === 0 ? (
            <View style={styles.emptyStateWrapper}>
              {activeTab === 'Hosted' ? (
                <EmptyState
                  imageSource={require('../../../assets/empty-state-tournament.png')}
                  headline="No hosted tournaments yet"
                  body="Create your first tournament and invite friends to play"
                  button={
                    <Button
                      title="Create tournament"
                      onPress={handleCreateTournament}
                      variant="primary"
                      fullWidth={false}
                    />
                  }
                />
              ) : (
                <EmptyState
                  imageSource={require('../../../assets/empty-state-tournament.png')}
                  headline="No joined tournaments"
                  body="Your joined tournaments will be displayed here"
                />
              )}
            </View>
          ) : (
            displayedTournaments.map((tournament) => {
              const isHost = userData && tournament.hostId === userData.uid;
              // Check if user is in any of the teams
              const userJoined = tournament.teams?.some(team =>
                team.player1?.userId === userData?.uid ||
                team.player2?.userId === userData?.uid
              ) || false;

              // Extract avatars from teams (max 4 players)
              const avatars = [];

              if (tournament.teams && Array.isArray(tournament.teams)) {
                for (const team of tournament.teams) {
                  if (team.player1 && avatars.length < 4) {
                    avatars.push(
                      <Avatar
                        key={`player1-${avatars.length}`}
                        size="small"
                        source={team.player1.avatarUri}
                        name={`${team.player1.firstName} ${team.player1.lastName}`}
                        withBorder={true}
                      />
                    );
                  }
                  if (team.player2 && avatars.length < 4) {
                    avatars.push(
                      <Avatar
                        key={`player2-${avatars.length}`}
                        size="small"
                        source={team.player2.avatarUri}
                        name={`${team.player2.firstName} ${team.player2.lastName}`}
                        withBorder={true}
                      />
                    );
                  }
                  if (avatars.length >= 4) break;
                }
              }

              return (
                <TournamentCard
                  key={tournament.id}
                  status={tournament.status}
                  title={tournament.name}
                  location={tournament.location}
                  dateTime={tournament.dateTime}
                  teamCount={tournament.teamCount}
                  registeredCount={tournament.registeredTeams}
                  avatars={avatars}
                  onPress={() => handleTournamentPress(tournament)}
                  onActionPress={() => handleTournamentPress(tournament)}
                  isHost={isHost}
                  userJoined={userJoined}
                  hostId={tournament.hostId}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.space4,
  },
  bannerContainer: {
    marginHorizontal: Spacing.space4,
    marginBottom: Spacing.space4,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.space4,
    paddingTop: 0,
    marginBottom: Spacing.space4,
  },
  avatarContainer: {
    marginBottom: Spacing.space3,
  },
  profileName: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline200,
    color: Colors.primary300,
    marginBottom: Spacing.space2,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.space4,
    justifyContent: 'space-between',
    marginBottom: Spacing.space2,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: Spacing.space2,
  },
  statValue: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body100,
    color: Colors.primary300,
    marginBottom: Spacing.space1,
  },
  statLabel: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body300,
    color: Colors.primary300,
    lineHeight: Typography.body300 * 1.1,
  },
  tabSelectorContainer: {
    paddingHorizontal: Spacing.space4,
    marginBottom: Spacing.space2,
  },
  tournamentsSection: {
    paddingHorizontal: Spacing.space4,
    marginTop: Spacing.space0,
  },
  emptyStateWrapper: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    marginBottom: Spacing.space4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.space8,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emptyStateImage: {
    width: 214,
    height: 214,
    resizeMode: 'contain',
  },
  emptyStateTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    marginTop: Spacing.space8,
    marginBottom: Spacing.space2,
    textAlign: 'center',
    lineHeight: Typography.headline100 * 1.18,
  },
  emptyStateDescription: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    textAlign: 'center',
    maxWidth: 252,
    lineHeight: Typography.body200 * 1.5,
    marginBottom: Spacing.space8,
  },
});
