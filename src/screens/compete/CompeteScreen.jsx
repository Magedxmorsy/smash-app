import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useTournaments } from '../../contexts/TournamentContext';
import { useAuth } from '../../contexts/AuthContext';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import MobileHeader from '../../components/ui/MobileHeader';
import TournamentCard from '../../components/tournament/TournamentCard';
import Avatar from '../../components/ui/Avatar';
import { Spacing } from '../../constants/Spacing';
import { Typography } from '../../constants/Typography';


export default function CompeteScreen({ navigation, onCreateTournament }) {
  const { tournaments: allTournaments, getOngoingTournaments, getCompletedTournaments } = useTournaments();
  const { userData } = useAuth();

  const ongoingTournaments = getOngoingTournaments();
  const completedTournaments = getCompletedTournaments();
  const tournaments = [...ongoingTournaments, ...completedTournaments];

  const handleCreateTournament = () => {
    // Use the onCreateTournament callback from App.js which handles auth and email verification
    if (onCreateTournament) {
      onCreateTournament(() => {
        // This callback runs after successful auth + email verification
        navigation.navigate('CreateTournamentModal', {
          editMode: false,
          onSave: handleTournamentCreated,
        });
      });
    } else {
      // Fallback if prop not provided (shouldn't happen)
      navigation.navigate('CreateTournamentModal', {
        editMode: false,
        onSave: handleTournamentCreated,
      });
    }
  };

  const handleTournamentPress = (tournament, openStartSheet = false) => {
    navigation.navigate('TournamentDetails', {
      tournament,
      openStartSheet,
    });
  };

  const handleTournamentCreated = (tournament) => {
    // Navigate to the newly created tournament using its ID
    // Pass the full tournament object as initial data to avoid loading delays
    if (tournament?.id) {
      navigation.navigate('TournamentDetails', {
        tournamentId: tournament.id,
        tournament: tournament,
      });
    }
  };



  return (
    <View style={styles.container}>
      <MobileHeader
        title="Compete"
        rightIcon={true}
        onRightPress={handleCreateTournament}
      />

      {tournaments.length === 0 ? (
        <View style={styles.content}>
          <EmptyState
            imageSource={require('../../../assets/empty-state-tournament.png')}
            headline="No tournaments yet"
            body="Create your first tournament or join one from friends"
            button={
              <Button
                title="Create tournament"
                onPress={handleCreateTournament}
                variant="primary"
                fullWidth={false}
              />
            }
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + Spacing.space4 }]}
          showsVerticalScrollIndicator={false}
        >
          {tournaments.map((tournament, index) => {
            const isHost = userData && tournament.hostId === userData.uid;
            // Check if user is in any of the teams
            const userJoined = tournament.teams?.some(team =>
              team.player1?.userId === userData?.uid ||
              team.player2?.userId === userData?.uid
            ) || false;

            // Only animate first 8 cards
            const shouldAnimate = index < 8;
            const animationIndex = shouldAnimate ? index : null;

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

            // Check if tournament is full and in registration
            const isAllFull = tournament.registeredTeams === tournament.teamCount;
            const isRegistration = tournament.status === 'REGISTRATION';
            const shouldOpenStartSheet = isHost && isAllFull && isRegistration;

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
                onActionPress={() => handleTournamentPress(tournament, shouldOpenStartSheet)}
                isHost={isHost}
                userJoined={userJoined}
                hostId={tournament.hostId}
                animationIndex={animationIndex}
              />
            );
          })}


        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.space4,
  },

});