import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import FullScreenModal from '../ui/FullScreenModal';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import CardGroup from '../ui/CardGroup';
import ListItem from '../ui/ListItem';
import Button from '../ui/Button';
import { Spacing } from '../../constants/Spacing';

import LocationIcon from '../../../assets/icons/location.svg';
import BallIcon from '../../../assets/icons/ball.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';
import TimeIcon from '../../../assets/icons/time.svg';
import TeamIcon from '../../../assets/icons/team.svg';
import EditIcon from '../../../assets/icons/edit.svg';
import CheckIcon from '../../../assets/icons/check.svg';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function CreateTournamentModal({ visible, onClose }) {
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
  const [currentPage, setCurrentPage] = useState('main'); // 'main' or 'rules'

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const handleCreate = () => {
    console.log('Creating tournament');
    onClose();
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

  const teamOptions = [4, 6, 8, 10, 12, 16, 20, 24, 32];

  const isFormValid = tournamentName.trim();
  const screenWidth = Dimensions.get('window').width;

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -screenWidth], // Slide left (current page moves out)
  });

  const translateXNext = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth, 0], // Slide in from right
  });

  return (
    <FullScreenModal
      visible={visible}
      onClose={currentPage === 'main' ? onClose : handleBackFromRules}
      title={currentPage === 'main' ? 'Create tournament' : 'Tournament rules'}
      leftIcon={currentPage === 'rules' ? <ChevronLeftIcon width={24} height={24} /> : null}
      scrollViewRef={scrollViewRef}
      footer={
        currentPage === 'main' ? (
          <Button
            title="Create tournament"
            onPress={handleCreate}
            variant="primary"
            disabled={!isFormValid}
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
                  onPress={() => setShowDatePicker(!showDatePicker)}
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
                  onPress={() => setShowTimePicker(!showTimePicker)}
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
                  onPress={() => setShowTeamPicker(!showTeamPicker)}
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
                icon={<EditIcon width={24} height={24} />}
                placeholder="Add rules (Optional)"
                value={rules}
                onPress={navigateToRules}
              />
            </CardGroup>
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
});