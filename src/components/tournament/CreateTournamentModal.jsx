import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform, Alert, Switch, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import FullScreenModal from '../ui/FullScreenModal';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import CardGroup from '../ui/CardGroup';
import ListItem from '../ui/ListItem';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Spacing } from '../../constants/Spacing';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useTournaments } from '../../contexts/TournamentContext';

import LocationIcon from '../../../assets/icons/location.svg';
import BallIcon from '../../../assets/icons/ball.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';
import TimeIcon from '../../../assets/icons/time.svg';
import TeamIcon from '../../../assets/icons/team.svg';
import RulesIcon from '../../../assets/icons/rules.svg';
import EditIcon from '../../../assets/icons/edit.svg';
import CheckIcon from '../../../assets/icons/check.svg';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';
import ChevronRightIcon from '../../../assets/icons/chevronright.svg';

export default function CreateTournamentModal({ visible, onClose, onTournamentCreated, editMode = false, tournament = null }) {
  const { createTournament, updateTournament } = useTournaments();
  const [tournamentName, setTournamentName] = useState('');
  const [location, setLocation] = useState('');
  const [courtNumbers, setCourtNumbers] = useState('');
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [teamCount, setTeamCount] = useState(null);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [rules, setRules] = useState('');
  const [tempRules, setTempRules] = useState('');
  const [joinAsPlayer, setJoinAsPlayer] = useState(true); // Default to true
  const [currentPage, setCurrentPage] = useState('main'); // 'main' or 'rules'
  const [isCreating, setIsCreating] = useState(false);

  // Check if tournament has started (not in REGISTRATION phase)
  const isTournamentStarted = editMode && tournament && tournament.status !== 'REGISTRATION';

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  // Pre-fill form when modal becomes visible
  useEffect(() => {
    if (!visible) return;

    console.log('🔍 Modal opened:', { editMode, tournamentId: tournament?.id });

    if (editMode && tournament) {
      console.log('✅ Pre-filling form with tournament data');
      setTournamentName(tournament.name || '');
      setLocation(tournament.location || '');
      setCourtNumbers(tournament.courts || '');
      setTeamCount(tournament.teamCount || null);
      setRules(tournament.rules || '');
      setJoinAsPlayer(tournament.joinAsPlayer !== undefined ? tournament.joinAsPlayer : true);
      setCurrentPage('main');

      // Parse and set date/time if available
      if (tournament.dateTime) {
        try {
          const dateTimeObj = new Date(tournament.dateTime);
          setDate(dateTimeObj);
          setTime(dateTimeObj);
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      }
    } else if (!editMode) {
      // Reset form for create mode
      setTournamentName('');
      setLocation('');
      setCourtNumbers('');
      setDate(null);
      setTime(null);
      setTeamCount(null);
      setRules('');
      setTempRules('');
      setJoinAsPlayer(true);
      setCurrentPage('main');
    }
  }, [visible]);

  const handleCreate = async () => {
    // Validate required fields
    if (!tournamentName.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
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
          // TODO: Integrate with actual notification service
          // For now, just log to console
          console.log('🔔 Sending notifications to all players:', notificationMessage);
          console.log('📧 Notifying participants of tournament:', resultTournament.name);
        }
      } else {
        // Create new tournament
        resultTournament = createTournament(tournamentData);
      }

      // Reset form
      setTournamentName('');
      setLocation('');
      setCourtNumbers('');
      setDate(null);
      setTime(null);
      setTeamCount(null);
      setRules('');
      setTempRules('');
      setCurrentPage('main');
      setIsCreating(false);

      onClose();

      // Notify parent with the created/updated tournament
      if (onTournamentCreated) {
        onTournamentCreated(resultTournament);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Error creating tournament:', error);
      setIsCreating(false);
    }
  };

  const navigateToRules = () => {
    setTempRules(rules);
    setCurrentPage('rules');
    // Reset scroll position to top
    setTimeout(() => {
      scrollViewRef.current?.scrollToPosition(0, 0, false);
    }, 50);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleBackFromRules = () => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage('main');
      setTempRules('');
    });
  };

  const handleSaveRules = () => {
    Keyboard.dismiss();
    setRules(tempRules);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage('main');
      setTempRules('');
    });
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setTime(selectedTime);
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

  const isFormValid = tournamentName.trim();
  const { width: screenWidth } = Dimensions.get('window');

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -screenWidth], // Slide left (current page moves out)
  });

  const translateXNext = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth, 0], // Slide in from right
  });

  console.log('🎨 CreateTournamentModal render:', { visible, editMode, tournamentId: tournament?.id, tournamentName });

  return (
    <FullScreenModal
      visible={visible}
      onClose={currentPage === 'main' ? onClose : handleBackFromRules}
      title={currentPage === 'main' ? (editMode ? 'Edit tournament' : 'Create tournament') : 'Tournament rules'}
      leftIcon={currentPage === 'rules' ? <ChevronLeftIcon width={24} height={24} /> : null}
      scrollViewRef={scrollViewRef}
      footer={
        currentPage === 'main' ? (
          <Button
            title={isCreating ? (editMode ? "Saving..." : "Creating...") : (editMode ? "Save changes" : "Create tournament")}
            onPress={handleCreate}
            variant="primary"
            disabled={!isFormValid || isCreating}
          />
        ) : null
      }
      rightIcon={
        currentPage === 'rules' ? (
          <CheckIcon width={24} height={24} />
        ) : null
      }
      onRightPress={currentPage === 'rules' ? handleSaveRules : null}
    >
      <Animated.View
        style={[
          styles.slidingContainer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Main Page */}
        <View style={styles.page}>
          <View style={styles.form}>
            <Input
              label="Name"
              placeholder="e.g. Amsterdam Padel Bros"
              value={tournamentName}
              onChangeText={setTournamentName}
              disabled={isTournamentStarted}
            />

            <CardGroup title="Details">
              <ListItem
                editable={true}
                icon={<LocationIcon width={24} height={24} />}
                placeholder="Enter club location"
                value={location}
                onChangeText={setLocation}
              />

              <ListItem
                editable={true}
                icon={<BallIcon width={24} height={24} />}
                placeholder="Add court number e.g. 2, 4, 5"
                value={courtNumbers}
                onChangeText={setCourtNumbers}
                keyboardType="numeric"
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
                />

                {showTeamPicker && Platform.OS === 'ios' && (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={teamCount || 4}
                      onValueChange={(itemValue) => setTeamCount(itemValue)}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      {teamOptions.map((count) => (
                        <Picker.Item
                          key={count}
                          label={`${count} teams`}
                          value={count}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </>

              <ListItem
                icon={<RulesIcon width={24} height={24} />}
                placeholder="Add rules (Optional)"
                value={rules}
                onPress={navigateToRules}
                useChevronRight={true}
              />
            </CardGroup>

            {/* Join as Player Toggle */}
            <Card>
              <View style={styles.toggleContainer}>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleLabel, isTournamentStarted && styles.disabledText]}>Join as a player</Text>
                  <Text style={[styles.toggleHint, isTournamentStarted && styles.disabledText]}>You'll be added to the tournament as a participant</Text>
                </View>
                <Switch
                  value={joinAsPlayer}
                  onValueChange={setJoinAsPlayer}
                  trackColor={{ false: Colors.neutral300, true: Colors.accent300 }}
                  thumbColor={Colors.surface}
                  ios_backgroundColor={Colors.neutral300}
                  disabled={isTournamentStarted}
                />
              </View>
            </Card>
          </View>
        </View>

        {/* Rules Page */}
        <View style={styles.page}>
          <View style={styles.rulesContainer}>
            <TextArea
              placeholder="Enter custom rules (optional)"
              value={tempRules}
              onChangeText={setTempRules}
              numberOfLines={4}
              maxLength={500}
              hint="Add any special rules for your tournament"
            />
          </View>
        </View>
      </Animated.View>

      {/* Date Picker Modal (Android only) */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
          accentColor="#281F42"
        />
      )}

      {/* Time Picker Modal (Android only) */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          accentColor="#281F42"
        />
      )}

      {/* Team Picker Modal (Android only) */}
      {showTeamPicker && Platform.OS === 'android' && (
        <View style={styles.androidPickerOverlay}>
          <Picker
            selectedValue={teamCount || 4}
            onValueChange={(itemValue) => {
              setTeamCount(itemValue);
              setShowTeamPicker(false);
            }}
          >
            {teamOptions.map((count) => (
              <Picker.Item
                key={count}
                label={`${count} teams`}
                value={count}
              />
            ))}
          </Picker>
        </View>
      )}
    </FullScreenModal>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  slidingContainer: {
    flexDirection: 'row',
  },
  page: {
    width: screenWidth,
    paddingHorizontal: Spacing.space4,
  },
  form: {
    gap: Spacing.space4,
  },
  rulesContainer: {
    marginTop: Spacing.space4,
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
    fontSize: 18,
    color: '#281F42',
  },
  androidPickerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: Spacing.space4,
  },
  saveText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 16,
    color: '#281F42',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.space1,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: Spacing.space3,
  },
  toggleLabel: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginBottom: Spacing.space1,
  },
  toggleHint: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body300,
    color: Colors.neutral400,
    lineHeight: Typography.body300 * Typography.lineHeightBody,
  },
  disabledText: {
    opacity: 0.5,
  },
});