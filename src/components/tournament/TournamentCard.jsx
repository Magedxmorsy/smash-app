import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Share, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { formatDateTime } from '../../utils/dateFormatter';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import DetailsListItem from '../ui/DetailsListItem';

// Icons
import LocationIcon from '../../../assets/icons/location.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';
import TimeIcon from '../../../assets/icons/time.svg';
import CompeteIcon from '../../../assets/icons/compete.svg';
import TeamIcon from '../../../assets/icons/team.svg';

// Component to show stacked avatars
function AvatarStack({ avatars, totalPlayers }) {
  // Display max 4 avatars
  const maxAvatars = 4;
  const displayAvatars = avatars.slice(0, maxAvatars);
  const remaining = totalPlayers - maxAvatars;

  return (
    <View style={styles.avatarStack}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.avatar,
            { zIndex: displayAvatars.length - index, marginLeft: index > 0 ? Spacing.avatarOverlap : 0 }
          ]}
        >
          {avatar}
        </View>
      ))}
      {remaining > 0 && (
        <Text style={styles.remainingText}>+{remaining}</Text>
      )}
    </View>
  );
}

// Component for empty state in avatar area
function EmptyAvatarState({ text, subtext }) {
  return (
    <View style={styles.emptyAvatarState}>
      <Text style={styles.emptyAvatarText}>{text}</Text>
      <Text style={styles.emptyAvatarSubtext}>{subtext}</Text>
    </View>
  );
}

export default function TournamentCard({
  status,
  title,
  location,
  dateTime,
  teamCount,
  registeredCount,
  avatars = [],
  onPress,
  onActionPress,
  isHost = false,
  userJoined = false,
  hostId = null,
  animationIndex = null, // Index for stagger animation (null = no animation)
}) {
  const isRegistration = status === 'REGISTRATION';

  // Format date and time from dateTime
  const tournamentDateTime = formatDateTime(dateTime);

  // Calculate fill percentage (registered teams / total team slots)
  // Note: registeredCount represents number of teams, not individual players
  const fillPercentage = registeredCount / teamCount;
  const isMoreThanHalf = fillPercentage > 0.5;
  const isAllFull = registeredCount === teamCount;

  // Determine button logic
  let buttonTitle = 'View';
  let buttonVariant = 'ghost';

  if (isHost) {
    if (isAllFull && isRegistration) {
      buttonTitle = 'Start';
      buttonVariant = 'primary';
    } else if (isMoreThanHalf) {
      buttonTitle = 'View';
      buttonVariant = 'ghost';
    } else {
      buttonTitle = 'Share';
      buttonVariant = 'ghost';
    }
  } else {
    if (userJoined || isAllFull || !isRegistration) {
      // Show View if: user already joined, tournament is full, or tournament already started
      buttonTitle = 'View';
      buttonVariant = 'ghost';
    } else {
      // Only show Join during REGISTRATION phase when user hasn't joined and slots available
      buttonTitle = 'Join';
      buttonVariant = 'accent';
    }
  }

  // Calculate total players (each team = 2 players)
  const totalPlayers = registeredCount * 2;

  // Determine avatar area content
  let showAvatars = true;
  let emptyStateText = null;
  let emptyStateSubtext = null;

  // Only show empty states and recruitment messages during REGISTRATION phase
  if (isRegistration) {
    // If no avatars are provided, always show empty state
    if (avatars.length === 0) {
      showAvatars = false;
      emptyStateText = "No players yet";
      emptyStateSubtext = isHost ? "Share to invite friends" : "Be the first to join";
    } else if (isHost) {
      // If there are avatars but no complete teams (totalPlayers === 0),
      // it means the host is the only player (incomplete team)
      if (avatars.length > 0 && totalPlayers === 0) {
        showAvatars = true; // Show the avatar(s)
        emptyStateText = avatars.length === 1 ? "You are the only player" : "Looking for more players";
        emptyStateSubtext = "Share to invite friends";
      } else if (totalPlayers === 2 && !isMoreThanHalf) {
        // One complete team but not more than half full
        showAvatars = true; // Show the host avatar
        emptyStateText = "You are the only player";
        emptyStateSubtext = "Share to invite friends";
      } else if (registeredCount === 1 && !isMoreThanHalf) {
        showAvatars = true; // Changed from false to show avatars
        emptyStateText = "Share to invite friends";
        emptyStateSubtext = "Share to invite friends";
      }
    }
  }
  // For GROUP_STAGE and other statuses, just show avatars without messages

  // Entrance animation (slide up only)
  const slideAnim = useRef(new Animated.Value(animationIndex !== null ? 20 : 0)).current;

  // Press animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Run entrance animation on mount if animationIndex is provided
  useEffect(() => {
    if (animationIndex !== null) {
      const delay = animationIndex * 80; // 80ms stagger between cards

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }).start();
    }
  }, [animationIndex]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my tournament "${title}" on Smash! 🎾`,
        title: 'Join my tournament',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share tournament');
      console.error('Error sharing:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={{
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        }}
      >
        <Card style={styles.card}>
      {/* Tournament Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Status Badge */}
      <Badge variant={status} label={status} style={styles.badge} />

      {/* Info Items */}
      <View style={styles.infoContainer}>
        <DetailsListItem
          icon={<LocationIcon width={24} height={24} />}
          text={location}
        />

        <DetailsListItem
          icon={<CalendarIcon width={24} height={24} />}
          text={tournamentDateTime}
        />

        <DetailsListItem
          icon={<TeamIcon width={24} height={24} />}
          text={`${teamCount} Teams`}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Section: Avatars/Empty State + Button */}
      <View style={styles.bottomSection}>
        {showAvatars && emptyStateText ? (
          // Show avatars with text overlay (for "only player" case)
          <View style={styles.avatarWithTextContainer}>
            <AvatarStack avatars={avatars} totalPlayers={totalPlayers} />
            <View style={styles.onlyPlayerText}>
              <Text style={styles.emptyAvatarText}>{emptyStateText}</Text>
              <Text style={styles.emptyAvatarSubtext}>{emptyStateSubtext}</Text>
            </View>
          </View>
        ) : showAvatars ? (
          <AvatarStack avatars={avatars} totalPlayers={totalPlayers} />
        ) : (
          <EmptyAvatarState text={emptyStateText} subtext={emptyStateSubtext} />
        )}

        <Button
          title={buttonTitle}
          onPress={buttonTitle === 'Share' ? handleShare : onActionPress}
          variant={buttonVariant}
          fullWidth={false}
          size="medium"
        />
      </View>
        </Card>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.space2,
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    marginBottom: Spacing.space2,
  },
  badge: {
    marginBottom: Spacing.space4,
  },
  infoContainer: {
    gap: Spacing.space1,
    marginBottom: Spacing.space4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.space4,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    overflow: 'hidden',
  },
  remainingText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginLeft: Spacing.space2,
  },
  emptyAvatarState: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyAvatarText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginBottom: Spacing.space1,
  },
  emptyAvatarSubtext: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body300,
    color: Colors.neutral400,
  },
  avatarWithTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space2,
  },
  onlyPlayerText: {
    flex: 1,
  },
});
