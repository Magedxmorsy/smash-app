import React, { useRef, useEffect } from 'react';
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
import VersusSmallIcon from '../../../assets/icons/vs-small.svg';
import TrophyIcon from '../../../assets/icons/compete.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';
import LocationIcon from '../../../assets/icons/location.svg';

export default function MatchCard({
  variant = 'before', // 'before' | 'during' | 'after' | 'placeholder'
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
  showBadge = true,
  canRecord = true,
  animationIndex = null, // Index for stagger animation (null = no animation)
}) {
  // Add defensive checks for missing team data (skip for placeholder variant)
  if (variant !== 'placeholder' && (!leftTeam || !rightTeam || !leftTeam.player1 || !rightTeam.player1)) {
    return null;
  }

  // Format date/time consistently
  const formattedDateTime = formatDateTime(dateTime);

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

  const CardContent = () => {
    // Placeholder variant for TBD matches in knockout/finals
    if (variant === 'placeholder') {
      return (
        <View style={styles.placeholderContainer}>
          <View style={styles.placeholderTeamLeft}>
            <Text style={styles.placeholderText}>{leftTeam?.player1?.firstName || '1st place'}</Text>
            <Text style={styles.placeholderSubtext}>{leftTeam?.player1?.lastName || 'Group A'}</Text>
          </View>

          <View style={styles.placeholderVersus}>
            <VersusSmallIcon width={24} height={24} />
          </View>

          <View style={styles.placeholderTeamRight}>
            <Text style={styles.placeholderText}>{rightTeam?.player1?.firstName || '2nd place'}</Text>
            <Text style={styles.placeholderSubtext}>{rightTeam?.player1?.lastName || 'Group B'}</Text>
          </View>
        </View>
      );
    }

    // Regular variants (before, during, after)
    return (
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

          {/* Date/time hidden for simplicity - still calculated and stored in match.dateTime */}
          {/* <DetailsListItem
            icon={<CalendarIcon width={24} height={24} />}
            text={formattedDateTime}
          /> */}

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

        {isPast && onAddScore && canRecord && (
          <Button
            title={scoreRecorded ? "Edit score" : "Add score"}
            variant="ghost"
            size="large"
            onPress={onAddScore}
          />
        )}
      </>
    );
  };

  return onPress ? (
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
        <View style={[styles.card, highlightBorder && styles.highlightBorder]}>
          {highlightBorder && showBadge && (
            <View style={styles.yourMatchBadge}>
              <Text style={styles.yourMatchText}>YOUR MATCH</Text>
            </View>
          )}
          <CardContent />
        </View>
      </Animated.View>
    </TouchableOpacity>
  ) : (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={[styles.card, highlightBorder && styles.highlightBorder]}>
        {highlightBorder && showBadge && (
          <View style={styles.yourMatchBadge}>
            <Text style={styles.yourMatchText}>YOUR MATCH</Text>
          </View>
        )}
        <CardContent />
      </View>
    </Animated.View>
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
    borderWidth: 2,
    borderColor: Colors.accent300,
  },
  yourMatchBadge: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    backgroundColor: Colors.accent300,
    paddingHorizontal: Spacing.space3,
    paddingTop: 1,
    paddingBottom: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 10,
  },
  yourMatchText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 10,
    color: Colors.primary300,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  // Placeholder variant styles
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderTeamLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  placeholderTeamRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  placeholderText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  placeholderSubtext: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginTop: Spacing.space1,
  },
  placeholderVersus: {
    // No margin needed - using space-between on parent container
  },
});
