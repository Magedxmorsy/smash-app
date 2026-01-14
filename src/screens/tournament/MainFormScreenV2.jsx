import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert, Switch, Keyboard, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Input from '../../components/ui/Input';
import CardGroup from '../../components/ui/CardGroup';
import ListItem from '../../components/ui/ListItem';
import Button from '../../components/ui/Button';
import { useTournamentForm } from '../../contexts/TournamentFormContext';
import { useTournaments } from '../../contexts/TournamentContext';
import { Spacing } from '../../constants/Spacing';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

import LocationIcon from '../../../assets/icons/location.svg';
import BallIcon from '../../../assets/icons/ball.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';
import TimeIcon from '../../../assets/icons/time.svg';
import TeamIcon from '../../../assets/icons/team.svg';
import RulesIcon from '../../../assets/icons/rules.svg';

export default function MainFormScreenV2({
  editMode,
  onSave,
  onClose,
  tournament,
  onNavigateToCourts,
  onNavigateToRules
}) {
  const { createTournament, updateTournament } = useTournaments();

  const {
    tournamentName,
    setTournamentName,
    location,
    setLocation,
    courtNumbers,
    date,
    setDate,
    time,
    setTime,
    teamCount,
    setTeamCount,
    rules,
    joinAsPlayer,
    setJoinAsPlayer,
    errors,
    setErrors,
  } = useTournamentForm();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Check if tournament has started (not in REGISTRATION phase)
  const isTournamentStarted = editMode && tournament && tournament.status !== 'REGISTRATION';

  const validateForm = () => {
    const newErrors = {
      name: '',
      location: '',
      date: '',
      time: '',
      teamCount: '',
    };

    let isValid = true;

    // Validate tournament name
    if (!tournamentName.trim()) {
      newErrors.name = 'Tournament name is required';
      isValid = false;
    }

    // Validate location
    if (!location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    // Validate date
    if (!date) {
      newErrors.date = 'Date is required';
      isValid = false;
    }

    // Validate time
    if (!time) {
      newErrors.time = 'Time is required';
      isValid = false;
    }

    // Validate team count
    if (!teamCount) {
      newErrors.teamCount = 'Number of teams is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreate = async () => {
    // Validate all required fields
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    try {
      // Combine date and time into a single datetime
      let tournamentDateTime = null;
      if (date) {
        tournamentDateTime = new Date(date);
        if (time) {
          tournamentDateTime.setHours(time.getHours());
          tournamentDateTime.setMinutes(time.getMinutes());
        }
      }

      const tournamentData = {
        name: tournamentName.trim(),
        location: location.trim() || 'Location TBD',
        courts: courtNumbers.trim() || null,
        dateTime: tournamentDateTime ? tournamentDateTime.toISOString() : null,
        format: 'World cup format',
        teamCount: teamCount || 8,
        rules: rules.trim() || 'Standard tournament rules apply.',
        joinAsPlayer: joinAsPlayer,
      };

      let resultTournament;
      let shouldNotifyPlayers = false;
      let notificationMessage = '';

      if (editMode && tournament?.id) {
        // Check if tournament has started and if critical fields changed
        if (isTournamentStarted) {
          const changedFields = [];

          // Check location change
          if (tournament.location !== tournamentData.location) {
            changedFields.push('location');
          }

          // Check date/time change
          const oldDateTime = tournament.dateTime ? new Date(tournament.dateTime).toISOString() : null;
          const newDateTime = tournamentData.dateTime;
          if (oldDateTime !== newDateTime) {
            changedFields.push('date/time');
          }

          // If any critical fields changed, prepare notification
          if (changedFields.length > 0) {
            shouldNotifyPlayers = true;
            notificationMessage = `Tournament updated: ${changedFields.join(' and ')} changed`;
            console.log('📢 Notification will be sent:', notificationMessage);
          }
        }

        // Update existing tournament
        updateTournament(tournament.id, tournamentData);
        resultTournament = { ...tournament, ...tournamentData };

        // Send notifications if needed
        if (shouldNotifyPlayers) {
          console.log('🔔 Sending notifications to all players:', notificationMessage);
          console.log('📧 Notifying participants of tournament:', resultTournament.name);
        }
      } else {
        // Create new tournament
        resultTournament = await createTournament(tournamentData);
      }

      // Notify parent
      if (onSave) {
        onSave(resultTournament);
      }

      // Close modal
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating/updating tournament:', error);
      Alert.alert('Error', 'Failed to save tournament. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
      if (errors.date) setErrors({ ...errors, date: '' });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setTime(selectedTime);
      if (errors.time) setErrors({ ...errors, time: '' });
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return time.toLocaleTimeString('en-US', options);
  };

  const formatTeamCount = (count) => {
    return count ? `${count} teams` : '';
  };

  const teamOptions = [6, 8, 10, 12, 16, 20, 24, 32];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Input
        label="Name"
        placeholder="e.g. Amsterdam Padel Bros"
        value={tournamentName}
        onChangeText={(value) => {
          setTournamentName(value);
          if (errors.name) setErrors({ ...errors, name: '' });
        }}
        disabled={isTournamentStarted}
        error={errors.name}
      />

      <CardGroup title="Details">
        <ListItem
          editable={true}
          icon={<LocationIcon width={24} height={24} />}
          placeholder="Enter club location"
          value={location}
          onChangeText={(value) => {
            setLocation(value);
            if (errors.location) setErrors({ ...errors, location: '' });
          }}
          error={errors.location}
        />

        <ListItem
          icon={<BallIcon width={24} height={24} />}
          placeholder="Add courts (Optional)"
          value={courtNumbers ? `Courts: ${courtNumbers}` : ''}
          onPress={onNavigateToCourts}
          useChevronRight={true}
          editable={false}
        />

        <>
          <ListItem
            icon={<CalendarIcon width={24} height={24} />}
            placeholder="Choose date"
            value={formatDate(date)}
            onPress={() => {
              Keyboard.dismiss();
              setShowDatePicker(!showDatePicker);
            }}
            error={errors.date}
          />

          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display="inline"
                onChange={handleDateChange}
                minimumDate={new Date()}
                themeVariant="light"
                accentColor="#281F42"
              />
            </View>
          )}
        </>

        <>
          <ListItem
            icon={<TimeIcon width={24} height={24} />}
            placeholder="Choose time"
            value={formatTime(time)}
            onPress={() => {
              Keyboard.dismiss();
              setShowTimePicker(!showTimePicker);
            }}
            error={errors.time}
          />

          {showTimePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={time || new Date()}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                themeVariant="light"
                accentColor="#281F42"
              />
            </View>
          )}
        </>

        <>
          <ListItem
            icon={<TeamIcon width={24} height={24} />}
            placeholder="Add number of teams"
            value={formatTeamCount(teamCount)}
            onPress={() => {
              if (isTournamentStarted) return;
              Keyboard.dismiss();
              setShowTeamPicker(!showTeamPicker);
            }}
            disabled={isTournamentStarted}
            error={errors.teamCount}
          />

          {showTeamPicker && Platform.OS === 'ios' && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={teamCount || 8}
                onValueChange={(itemValue) => {
                  setTeamCount(itemValue);
                  if (errors.teamCount) setErrors({ ...errors, teamCount: '' });
                }}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {teamOptions.map((count) => (
                  <Picker.Item
                    key={count}
                    label={`${count} teams`}
                    value={count}
                    color={Colors.primary300}
                  />
                ))}
              </Picker>
            </View>
          )}
        </>
      </CardGroup>

      <CardGroup title="Options">
        <ListItem
          icon={<RulesIcon width={24} height={24} />}
          placeholder="Add custom rules (Optional)"
          value={rules}
          onPress={onNavigateToRules}
          useChevronRight={true}
          editable={false}
        />

        <View style={styles.switchRow}>
          <View style={styles.switchContent}>
            <TeamIcon width={24} height={24} color={Colors.primary300} />
            <Text style={styles.switchLabel}>Join as player</Text>
          </View>
          <Switch
            value={joinAsPlayer}
            onValueChange={setJoinAsPlayer}
          />
        </View>
      </CardGroup>

      {isTournamentStarted && (
        <View style={styles.clarificationBox}>
          <Text style={styles.clarificationText}>
            <Text style={styles.clarificationBold}>Note:</Text> This tournament has already started.
            You can only edit the location, date, time, and rules. Changes to location or date/time will notify all participants.
          </Text>
        </View>
      )}

      <Button
        title={isCreating ? (editMode ? "Saving..." : "Creating...") : (editMode ? "Save changes" : "Create tournament")}
        onPress={handleCreate}
        variant="primary"
        disabled={isCreating}
      />

      {/* Date Picker Modal (Android only) */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker Modal (Android only) */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Team Count Picker Modal - Android shows immediately when pressing */}
      {Platform.OS === 'android' && showTeamPicker && (
        <View style={styles.androidPickerModal}>
          <Picker
            selectedValue={teamCount || 8}
            onValueChange={(itemValue) => {
              setTeamCount(itemValue);
              setShowTeamPicker(false);
              if (errors.teamCount) setErrors({ ...errors, teamCount: '' });
            }}
            style={styles.androidPicker}
          >
            {teamOptions.map((count) => (
              <Picker.Item
                key={count}
                label={`${count} teams`}
                value={count}
                color={Colors.primary300}
              />
            ))}
          </Picker>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    gap: Spacing.space4,
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space8,
  },
  pickerContainer: {
    paddingVertical: Spacing.space2,
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: 180,
  },
  pickerItem: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space4,
  },
  switchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space3,
  },
  switchLabel: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  clarificationBox: {
    backgroundColor: Colors.primary50,
    borderRadius: 12,
    padding: Spacing.space4,
    borderWidth: 1,
    borderColor: Colors.primary100,
  },
  clarificationText: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body300,
    color: Colors.neutral400,
    lineHeight: Typography.body300 * 1.5,
  },
  clarificationBold: {
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.primary300,
  },
  androidPickerModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 20,
  },
  androidPicker: {
    width: '100%',
    color: Colors.primary300,
  },
});
