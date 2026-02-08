import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Switch, Keyboard, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Input from '../../components/ui/Input';
import CardGroup from '../../components/ui/CardGroup';
import ListItem from '../../components/ui/ListItem';
import Button from '../../components/ui/Button';
import Banner from '../../components/ui/Banner';
import RescheduleConfirmationDialog from '../../components/tournament/RescheduleConfirmationDialog';
import { useTournamentForm } from '../../contexts/TournamentFormContext';
import { useTournaments } from '../../contexts/TournamentContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
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
  const { userData } = useAuth();

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
    matchDuration,
    setMatchDuration,
  } = useTournamentForm();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [pendingTournamentData, setPendingTournamentData] = useState(null);
  const [changesDescription, setChangesDescription] = useState('');

  const [showDurationPicker, setShowDurationPicker] = useState(false);

  // Ref for Android picker to trigger native dialog
  const androidPickerRef = useRef(null);
  const androidDurationPickerRef = useRef(null);

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
    console.log('🚀 handleCreate called', { editMode, tournamentId: tournament?.id });

    // Validate all required fields
    if (!validateForm()) {
      console.log('❌ Validation failed');
      return;
    }

    setIsCreating(true);

    try {
      // Combine date and time into a single datetime
      let tournamentDateTime = null;
      if (date && time) {
        // IMPORTANT: Extract date/time components using UTC methods to preserve the exact date
        // The pickers return dates in UTC that represent the LOCAL date/time the user selected
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDate();
        const hours = time.getUTCHours();
        const minutes = time.getUTCMinutes();

        // Create the combined datetime in UTC, which will represent the local time
        tournamentDateTime = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));

        console.log('📅 DateTime construction:', {
          dateValue: date,
          timeValue: time,
          year, month, day, hours, minutes,
          combinedDateTime: tournamentDateTime,
          isoString: tournamentDateTime.toISOString(),
          localString: tournamentDateTime.toString()
        });
      } else if (date) {
        // If only date is provided, use noon UTC
        tournamentDateTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0, 0));
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
        matchDuration: matchDuration || 30,
      };

      // Helper to remove undefined fields recursively (using JSON trick)
      const sanitizeData = (data) => {
        return JSON.parse(JSON.stringify(data));
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

        // Handle joinAsPlayer toggle - add/remove host from teams
        const wasJoinedAsPlayer = tournament.joinAsPlayer === true;
        const isNowJoinedAsPlayer = tournamentData.joinAsPlayer === true;

        console.log('🔄 JoinAsPlayer toggle check:', {
          wasJoinedAsPlayer,
          isNowJoinedAsPlayer,
          currentTeamsLength: (tournament.teams || []).length,
          userId: userData?.uid
        });

        // Check if host toggled joinAsPlayer from false to true
        if (!wasJoinedAsPlayer && isNowJoinedAsPlayer) {
          // Host wants to join - add them to teams array
          const currentTeams = tournament.teams || [];
          const hostAlreadyInTeam = currentTeams.some(team =>
            team.player1?.userId === userData?.uid || team.player2?.userId === userData?.uid
          );

          console.log('✅ Host toggled joinAsPlayer to true', {
            hostAlreadyInTeam,
            currentTeamsLength: currentTeams.length
          });

          if (!hostAlreadyInTeam && userData) {
            // Add host as a new team
            const newTeam = {
              player1: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                avatarUri: userData.avatarUri || null,
                userId: userData.uid,
              },
              player2: null,
              isAdminTeam: true,
            };

            const updatedTeams = [...currentTeams, newTeam];

            // Only add to participantIds if not already present
            const currentParticipantIds = tournament.participantIds || [];
            const updatedParticipantIds = currentParticipantIds.includes(userData.uid)
              ? currentParticipantIds
              : [...currentParticipantIds, userData.uid];

            tournamentData.teams = updatedTeams;
            tournamentData.participantIds = updatedParticipantIds;
            tournamentData.registeredTeams = updatedTeams.filter(t => t.player1 && t.player2).length;

            console.log('📝 Adding host to tournament:', {
              newTeamsLength: updatedTeams.length,
              participantIdsLength: updatedParticipantIds.length,
              newTeam
            });
          }
        }

        // Check if rescheduling confirmation is needed
        // LOGIC REMOVED as per user request (Step 582): "believe it is not neseaasry now we should just update the date and time of the torunament simple"
        /*
        if (tournament.matches && tournament.matches.length > 0) {
           // ... logic removed ...
        }
        */

        // Update existing tournament
        console.log('💾 Updating tournament with data:', {
          tournamentId: tournament.id,
          location: tournamentData.location,
          dateTime: tournamentData.dateTime,
          hasTeams: !!tournamentData.teams,
          teamsLength: tournamentData.teams?.length,
          joinAsPlayer: tournamentData.joinAsPlayer
        });

        const cleanData = sanitizeData(tournamentData);
        await updateTournament(tournament.id, cleanData);
        resultTournament = { ...tournament, ...cleanData };

        console.log('✅ Tournament update complete');

        // Send notifications if needed
        if (shouldNotifyPlayers) {
          console.log('🔔 Sending notifications to all players:', notificationMessage);
          console.log('📧 Notifying participants of tournament:', resultTournament.name);
        }
      } else {
        // Create new tournament
        const cleanData = sanitizeData(tournamentData);
        resultTournament = await createTournament(cleanData);
      }

      // Show success toast
      if (editMode) {
        showToast('Tournament updated successfully', 'success');
      } else {
        showToast('Tournament created successfully', 'success');
      }

      // Notify parent (which will handle closing the modal in edit mode)
      if (onSave) {
        onSave(resultTournament);
      }

      // Close modal only for create mode (edit mode closing is handled by parent's onSave callback)
      if (!editMode && onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating/updating tournament:', error);
      showToast('Failed to save tournament. Please try again.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRescheduleConfirm = async () => {
    console.log('✅ User confirmed rescheduling');
    setShowRescheduleDialog(false);

    // Clean up state immediately to prevent re-triggers
    const dataToSave = pendingTournamentData;
    setPendingTournamentData(null);
    setChangesDescription('');

    setIsCreating(true);

    try {
      if (dataToSave && tournament?.id) {
        await updateTournament(tournament.id, dataToSave);
        const resultTournament = { ...tournament, ...dataToSave };

        showToast('Tournament updated successfully', 'success');

        // Call onSave which will close the modal
        if (onSave) {
          onSave(resultTournament);
        }
      }
    } catch (error) {
      console.error('Error updating tournament after confirmation:', error);
      showToast('Failed to save tournament. Please try again.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRescheduleCancel = () => {
    console.log('❌ User cancelled rescheduling');
    setShowRescheduleDialog(false);
    setPendingTournamentData(null);
    setChangesDescription('');
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

  const formatDuration = (minutes) => {
    return minutes ? `Match duration: ${minutes} min` : '';
  };

  // Team counts designed to prevent 2-team groups:
  // - 6 teams: 2 groups of 3
  // - 8+ teams: All divisible by 4 for even 4-team groups
  const teamOptions = [6, 8, 12, 16, 20, 24, 32];
  const durationOptions = [15, 30, 45];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.container, { paddingBottom: Spacing.space24 + insets.bottom }]}
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
          leftIcon={<LocationIcon width={24} height={24} color={Colors.primary300} />}
        />

        <CardGroup title="Details">

          <ListItem
            icon={<BallIcon width={24} height={24} color={Colors.primary300} />}
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
              icon={<CalendarIcon width={24} height={24} color={Colors.primary300} />}
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
              icon={<TimeIcon width={24} height={24} color={Colors.primary300} />}
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
            icon={<CompeteIcon width={24} height={24} color={Colors.primary300} />}
            placeholder="Tournament format"
            value={format ? `Format: ${format}` : ''}
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
              icon={<TeamIcon width={24} height={24} color={Colors.primary300} />}
              placeholder="Add number of teams"
              value={formatTeamCount(teamCount)}
              onPress={() => {
                if (isTournamentStarted) return;
                Keyboard.dismiss();
                if (Platform.OS === 'android') {
                  // On Android, focus the hidden Picker to trigger native dialog
                  androidPickerRef.current?.focus();
                } else {
                  // On iOS, toggle inline picker visibility
                  setShowTeamPicker(!showTeamPicker);
                }
              }}
              disabled={isTournamentStarted}
              error={errors.teamCount}
            />

            {/* iOS: Inline picker */}
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

            {/* Android: Hidden picker that triggers native dialog */}
            {Platform.OS === 'android' && (
              <Picker
                ref={androidPickerRef}
                selectedValue={teamCount || 8}
                onValueChange={(itemValue) => {
                  setTeamCount(itemValue);
                  if (errors.teamCount) setErrors({ ...errors, teamCount: '' });
                }}
                style={styles.hiddenPicker}
              >
                {teamOptions.map((count) => (
                  <Picker.Item
                    key={count}
                    label={`${count} teams`}
                    value={count}
                  />
                ))}
              </Picker>
            )}
          </>

          <>
            <ListItem
              icon={<TimeIcon width={24} height={24} color={Colors.primary300} />}
              placeholder="Match duration"
              value={formatDuration(matchDuration)}
              onPress={() => {
                if (isTournamentStarted) return;
                Keyboard.dismiss();
                if (Platform.OS === 'android') {
                  androidDurationPickerRef.current?.focus();
                } else {
                  setShowDurationPicker(!showDurationPicker);
                }
              }}
              disabled={isTournamentStarted}
            />

            {/* iOS: Inline picker for Duration */}
            {showDurationPicker && Platform.OS === 'ios' && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={matchDuration || 30}
                  onValueChange={(itemValue) => {
                    setMatchDuration(itemValue);
                  }}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {durationOptions.map((duration) => (
                    <Picker.Item
                      key={duration}
                      label={`${duration} min`}
                      value={duration}
                      color={Colors.primary300}
                    />
                  ))}
                </Picker>
              </View>
            )}

            {/* Android: Hidden picker for Duration */}
            {Platform.OS === 'android' && (
              <Picker
                ref={androidDurationPickerRef}
                selectedValue={matchDuration || 30}
                onValueChange={(itemValue) => {
                  setMatchDuration(itemValue);
                }}
                style={styles.hiddenPicker}
              >
                {durationOptions.map((duration) => (
                  <Picker.Item
                    key={duration}
                    label={`${duration} min`}
                    value={duration}
                  />
                ))}
              </Picker>
            )}
          </>
        </CardGroup>

        <CardGroup title="Rules">
          <ListItem
            icon={<RulesIcon width={24} height={24} color={Colors.primary300} />}
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
            <View style={[styles.switchRow, Platform.OS === 'android' && styles.switchRowAndroid]}>
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

      </ScrollView>

      {/* Floating CTA Button */}
      <View style={[styles.floatingButtonContainer, { paddingBottom: insets.bottom + (Platform.OS === 'android' ? 24 : 0) }]}>
        <Button
          title={editMode ? 'Save' : 'Create'}
          onPress={handleCreate}
          disabled={isCreating}
          loading={isCreating}
          fullWidth
        />
      </View>

      {/* Reschedule Confirmation Dialog */}
      <RescheduleConfirmationDialog
        visible={showRescheduleDialog}
        onConfirm={handleRescheduleConfirm}
        onCancel={handleRescheduleCancel}
        changesDescription={changesDescription}
      />
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
    paddingVertical: Spacing.space4, // 16px for iOS
    paddingHorizontal: Spacing.space4, // 16px (same for both platforms)
  },
  switchRowAndroid: {
    paddingVertical: Spacing.space2, // 8px for Android (top and bottom only)
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
  hiddenPicker: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.space4,
  },
});
