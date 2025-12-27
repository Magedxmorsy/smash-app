import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import CardGroup from '../../components/ui/CardGroup';
import ListItem from '../../components/ui/ListItem';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function NotificationsSettingsScreen({ navigation }) {
  const [allNotifications, setAllNotifications] = useState(true);
  const [tournamentNotifications, setTournamentNotifications] = useState(true);
  const [teamNotifications, setTeamNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);

  const handleMasterToggle = (value) => {
    setAllNotifications(value);
    // When master is turned off, turn off all others
    if (!value) {
      setTournamentNotifications(false);
      setTeamNotifications(false);
      setMatchNotifications(false);
    } else {
      // When master is turned on, turn on all others
      setTournamentNotifications(true);
      setTeamNotifications(true);
      setMatchNotifications(true);
    }
  };

  const handleCategoryToggle = (setter, value) => {
    setter(value);
    // If any category is turned off, master should be off
    if (!value) {
      setAllNotifications(false);
    } else {
      // If all categories are on, turn master on
      const allOn =
        (setter === setTournamentNotifications ? value : tournamentNotifications) &&
        (setter === setTeamNotifications ? value : teamNotifications) &&
        (setter === setMatchNotifications ? value : matchNotifications);
      if (allOn) {
        setAllNotifications(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeftIcon width={32} height={32} color={Colors.primary300} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        {/* Empty view to balance the layout */}
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Toggle */}
        <CardGroup>
          <ListItem
            value="Enable All Notifications"
            subtitle="Turn all notifications on or off"
            showChevron={false}
            rightComponent={
              <Switch
                value={allNotifications}
                onValueChange={handleMasterToggle}
              />
            }
          />
        </CardGroup>

        {/* Category Toggles */}
        <CardGroup title="Notification Categories">
          <ListItem
            value="Tournament Notifications"
            subtitle="Invites, updates, start times, and results"
            showChevron={false}
            rightComponent={
              <Switch
                value={tournamentNotifications}
                onValueChange={(value) => handleCategoryToggle(setTournamentNotifications, value)}
              />
            }
          />
          <ListItem
            value="Team Notifications"
            subtitle="Team invites and member updates"
            showChevron={false}
            rightComponent={
              <Switch
                value={teamNotifications}
                onValueChange={(value) => handleCategoryToggle(setTeamNotifications, value)}
              />
            }
          />
          <ListItem
            value="Match Notifications"
            subtitle="Match times, scores, and results"
            showChevron={false}
            rightComponent={
              <Switch
                value={matchNotifications}
                onValueChange={(value) => handleCategoryToggle(setMatchNotifications, value)}
              />
            }
          />
        </CardGroup>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space8,
    gap: Spacing.space6,
  },
});
