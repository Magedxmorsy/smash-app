import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert, Switch, Keyboard, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Input from '../../components/ui/Input';
import CardGroup from '../../components/ui/CardGroup';
import ListItem from '../../components/ui/ListItem';
import Button from '../../components/ui/Button';
import Banner from '../../components/ui/Banner';
import { useTournamentForm } from '../../contexts/TournamentFormContext';
import { useTournaments } from '../../contexts/TournamentContext';
import { useToast } from '../../contexts/ToastContext';
import { Spacing } from '../../constants/Spacing';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

import LocationIcon from '../../../assets/icons/location.svg';
import BallIcon from '../../../assets/icons/ball.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';
import TimeIcon from '../../../assets/icons/time.svg';
import CompeteIcon from '../../../assets/icons/compete.svg';
import TeamIcon from '../../../assets/icons/team.svg';
import RulesIcon from '../../../assets/icons/rules.svg';

export default function MainFormScreen({ onNavigate, editMode, onSave, onClose, tournament }) {
  const insets = useSafeAreaInsets();
  const { createTournament, updateTournament } = useTournaments();
  const { showToast } = useToast();

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
    format,
    setFormat,
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
  const [bannerDismissed, setBannerDismissed] = useState(false);

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
        format: format || 'World cup',
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

      // Show success toast
      if (editMode) {
        showToast('Tournament updated successfully', 'success');
      } else {
        showToast('Tournament created successfully', 'success');
      }

      // Notify parent
      if (onSave) {
        onSave(resultTournament);
      }

      // Close modal (only for edit mode - create mode navigation handled by parent)
      if (editMode && onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating/updating tournament:', error);
      showToast('Failed to save tournament. Please try again.', 'error');
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

  // Team counts designed to prevent 2-team groups:
  // - 6 teams: 2 groups of 3
  // - 8+ teams: All divisible by 4 for even 4-team groups
  const teamOptions = [6, 8, 12, 16, 20, 24, 32];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.container, { paddingBottom: 100 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      {isTournamentStarted && !bannerDismissed && (
        <View style={styles.bannerContainer}>
          <Banner
            variant="info"
            message="Tournament has started. Format and team count can't be changed."
            dismissible={true}
            onClose={() => setBannerDismissed(true)}
          />
        </View>
      )}

      <Input
        label="Name"
        placeholder="e.g. Amsterdam Padel Bros"
        value={tournamentName}
        onChangeText={(value) => {
          setTournamentName(value);
          if (errors.name) setErrors({ ...errors, name: '' });
        }}
        error={errors.name}
      />

      <Input
        label="Location"
        placeholder="Enter tournament location"
        value={location}
        onChangeText={(value) => {
          setLocation(value);
          if (errors.location) setErrors({ ...errors, location: '' });
        }}
        error={errors.location}
        leftIcon={<LocationIcon width={24} height={24} />}
      />

      <CardGroup title="Details">

        <ListItem
          icon={<BallIcon width={24} height={24} />}
          placeholder="Add courts (Optional)"
          value={courtNumbers ? `Courts: ${courtNumbers}` : ''}
          onPress={() => {
            console.log('🔵 Courts pressed! Navigating...');
            onNavigate('courts');
          }}
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

        <ListItem
          icon={<CompeteIcon width={24} height={24} />}
          placeholder="Tournament format"
          value={format}
          onPress={() => {
            if (isTournamentStarted) return;
            console.log('🔵 Format pressed! Navigating...');
            onNavigate('format');
          }}
          useChevronRight={true}
          editable={false}
          disabled={isTournamentStarted}
        />

        <>
          <ListItem
            icon={<TeamIcon width={24} height={24} />}
            placeholder="Add number of teams"
            value={formatTeamCount(teamCount)}
            onPress={() => {
              console.log('🔧 Team picker pressed!');
              console.log('🔧 isTournamentStarted:', isTournamentStarted);
              console.log('🔧 Platform:', Platform.OS);
              if (isTournamentStarted) return;
              Keyboard.dismiss();
              setShowTeamPicker(true);
              console.log('🔧 setShowTeamPicker(true) called');
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

      <CardGroup title="Rules">
        <ListItem
          icon={<RulesIcon width={24} height={24} />}
          placeholder="Add custom rules (Optional)"
          value={rules}
          onPress={() => {
            console.log('🔵 Rules pressed! Navigating...');
            onNavigate('rules');
          }}
          useChevronRight={true}
          editable={false}
        />
      </CardGroup>

      <CardGroup title="Host options">
        <View>
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
          <Text style={styles.switchDescription}>
            Add yourself as a participant
          </Text>
        </View>
      </CardGroup>


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

      {/* Team Count Picker Modal (Android only) */}
      {Platform.OS === 'android' && showTeamPicker && (
        <Modal
          visible={showTeamPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            console.log('🔧 Modal onRequestClose called');
            setShowTeamPicker(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => {
                console.log('🔧 Backdrop pressed');
                setShowTeamPicker(false);
              }}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select number of teams</Text>
                <TouchableOpacity onPress={() => setShowTeamPicker(false)}>
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={teamCount || 8}
                onValueChange={(itemValue) => {
                  console.log('🔧 Picker value changed:', itemValue);
                  setTeamCount(itemValue);
                  if (errors.teamCount) setErrors({ ...errors, teamCount: '' });
                }}
                style={styles.androidPickerModal}
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
          </View>
        </Modal>
      )}
      </ScrollView>

      {/* Sticky Button */}
      <View style={[styles.stickyButton, { paddingBottom: Spacing.space1 + insets.bottom }]}>
        <Button
          title={isCreating ? (editMode ? "Saving..." : "Creating...") : (editMode ? "Save changes" : "Create tournament")}
          onPress={handleCreate}
          variant="primary"
          disabled={isCreating}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    gap: Spacing.space4,
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
  },
  bannerContainer: {
    marginBottom: Spacing.space2, // 8px
  },
  stickyButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.space4,
    backgroundColor: Colors.background,
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
  switchDescription: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body200,
    color: Colors.neutral400,
    paddingLeft: Spacing.space4 + 24 + Spacing.space3, // Card padding + icon width + gap
    paddingRight: Spacing.space4,
    paddingBottom: Spacing.space4,
    marginTop: -Spacing.space2, // Pull description closer to toggle
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Spacing.space8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body100,
    color: Colors.primary300,
  },
  modalDone: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.accent300,
  },
  androidPickerModal: {
    width: '100%',
    color: Colors.primary300,
  },
});
