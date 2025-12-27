import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { formatDateTime } from '../../utils/dateFormatter';
import Team from '../ui/Team';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import DetailsListItem from '../ui/DetailsListItem';
import VersusIcon from '../../../assets/icons/versus.svg';
import TrophyIcon from '../../../assets/icons/compete.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';
import LocationIcon from '../../../assets/icons/location.svg';

export default function MatchCard({
  variant = 'before', // 'before' | 'during' | 'after'
  leftTeam,
  rightTeam,
  tournamentName,
  status,
  dateTime,
  location,
  court,
  isPast = false,
  score,
  scoreRecorded = false,
  onAddScore,
  onAddToCalendar,
  onPress,
  onViewDetails,
  highlightBorder = false,
}) {
  // Add defensive checks for missing team data
  if (!leftTeam || !rightTeam || !leftTeam.player1 || !rightTeam.player1) {
    return null;
  }

  // Format date/time consistently
  const formattedDateTime = formatDateTime(dateTime);

  // Animation for press state
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const CardContent = () => (
    <>
      {/* Teams Section */}
      <View style={styles.teamsContainer}>
        <View style={styles.leftTeam}>
          <Team
            player1={leftTeam.player1}
            player2={leftTeam.player2}
            align="left"
          />
        </View>

        {/* VS Icon or Score Display */}
        {scoreRecorded && score ? (
          <View style={styles.scoreContainer}>
            {score.map((set, index) => (
              <React.Fragment key={index}>
                <Text style={styles.scoreText}>{set.teamA} - {set.teamB}</Text>
                {index < score.length - 1 && <View style={styles.scoreDivider} />}
              </React.Fragment>
            ))}
          </View>
        ) : (
          <View style={styles.versusContainer}>
            <VersusIcon width={36} height={100} />
          </View>
        )}

        <View style={styles.rightTeam}>
          <Team
            player1={rightTeam.player1}
            player2={rightTeam.player2}
            align="right"
          />
        </View>
      </View>

      {/* Divider with Badge */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        {status && (
          <View style={styles.badgeContainer}>
            <Badge variant={status} label={status} />
          </View>
        )}
      </View>

      {/* Match Info */}
      <View style={styles.infoSection}>
        {tournamentName && (
          <DetailsListItem
            icon={<TrophyIcon width={24} height={24} />}
            text={tournamentName}
          />
        )}

        <DetailsListItem
          icon={<CalendarIcon width={24} height={24} />}
          text={formattedDateTime}
        />

        <DetailsListItem
          icon={<LocationIcon width={24} height={24} />}
          text={court ? `${location} - ${court}` : location}
        />
      </View>

      {/* Action Button */}
      {!isPast && onAddToCalendar && (
        <Button
          title="Add to calendar"
          variant="ghost"
          size="large"
          onPress={onAddToCalendar}
        />
      )}

      {isPast && onAddScore && (
        <Button
          title={scoreRecorded ? "Edit score" : "Record score"}
          variant="ghost"
          size="large"
          onPress={onAddScore}
        />
      )}
    </>
  );

  return onPress ? (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <View style={[styles.card, highlightBorder && styles.highlightBorder]}>
          <CardContent />
        </View>
      </Animated.View>
    </TouchableOpacity>
  ) : (
    <View style={[styles.card, highlightBorder && styles.highlightBorder]}>
      <CardContent />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.radius4,
    padding: Spacing.space4,
    gap: Spacing.space4,
  },
  highlightBorder: {
    borderWidth: 1,
    borderColor: Colors.accent300,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftTeam: {
    flex: 1,
  },
  rightTeam: {
    flex: 1,
  },
  versusContainer: {
    marginHorizontal: Spacing.space1,
  },
  scoreContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.radius2,
    paddingVertical: Spacing.space1,
    paddingHorizontal: Spacing.space2,
    alignItems: 'center',
  },
  scoreText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  scoreDivider: {
    height: Spacing.dividerHeight,
    backgroundColor: Colors.border,
    width: '100%',
    marginVertical: Spacing.space1,
  },
  dividerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: Spacing.dividerHeight,
    backgroundColor: Colors.border,
    width: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.space2,
  },
  infoSection: {
    gap: Spacing.space1,
  },
});
