import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import MobileHeader from '../../components/ui/MobileHeader';
import NotificationItem from '../../components/notification/NotificationItem';
import { useNotifications } from '../../contexts/NotificationContext';

export default function UpdatesScreen({ navigation }) {
  const { notifications, loading, markAsRead } = useNotifications();

  const handleNotificationPress = (notification) => {
    // Mark notification as read when tapped
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Optional: Deep link to tournament or match if metadata exists
    // Commenting out navigation for now - user just wants to mark as read on tap
    // if (notification.metadata?.tournamentId) {
    //   navigation.navigate('CompeteTab', {
    //     screen: 'TournamentDetails',
    //     params: { tournamentId: notification.metadata.tournamentId }
    //   });
    // } else if (notification.metadata?.matchId) {
    //   navigation.navigate('HomeTab', {
    //     screen: 'MatchDetails',
    //     params: { matchId: notification.metadata.matchId }
    //   });
    // }
  };

  // Helper to create action button for specific notification types
  const getActionButton = (notification) => {
    // "View" button for score notifications
    if (notification.action === 'score_added' || notification.action === 'score_updated') {
      return {
        label: 'View',
        onPress: () => handleNotificationPress(notification),
      };
    }

    // "Start" button for tournament_full notifications
    if (notification.action === 'tournament_full') {
      return {
        label: 'Start',
        onPress: () => {
          markAsRead(notification.id);
          navigation.navigate('CompeteTab', {
            screen: 'TournamentDetails',
            params: {
              tournamentId: notification.metadata.tournamentId,
              openStartSheet: true, // Signal to open start tournament sheet
            }
          });
        },
      };
    }

    return null;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <MobileHeader title="Updates" rightIcon={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent300} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MobileHeader
        title="Updates"
        rightIcon={false}
      />

      {notifications.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateContent}>
            <Image
              source={require('../../../assets/noupdates.png')}
              style={styles.emptyStateImage}
            />

            <Text style={styles.emptyStateTitle}>No updates yet</Text>
            <Text style={styles.emptyStateDescription}>
              You'll see notifications about tournaments, matches, and team updates here
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: 60 + Spacing.space4 }]}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={{
                ...notification,
                actionButton: getActionButton(notification),
              }}
              onPress={() => handleNotificationPress(notification)}
              showDivider={index < notifications.length - 1}
            />
          ))}
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.space2, // Small padding at top
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});
