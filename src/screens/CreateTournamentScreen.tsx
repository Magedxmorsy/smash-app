import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  ActivityIndicator,
  Menu,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { createTournament } from '../services/tournamentService';
import { TournamentFormat } from '../types';
import { COLORS, TEAM_COUNT_OPTIONS, TOURNAMENT_FORMATS } from '../constants';

export const CreateTournamentScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [format, setFormat] = useState(TournamentFormat.WORLD_CUP);
  const [numberOfTeams, setNumberOfTeams] = useState(8);
  const [rules, setRules] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamsMenuVisible, setTeamsMenuVisible] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDateTime = new Date(dateTime);
      newDateTime.setFullYear(selectedDate.getFullYear());
      newDateTime.setMonth(selectedDate.getMonth());
      newDateTime.setDate(selectedDate.getDate());
      setDateTime(newDateTime);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(dateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setDateTime(newDateTime);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Tournament name is required');
      return false;
    }

    if (!photoURL) {
      setError('Tournament photo is required');
      return false;
    }

    if (!location.trim()) {
      setError('Location is required');
      return false;
    }

    if (dateTime <= new Date()) {
      setError('Tournament date must be in the future');
      return false;
    }

    if (!rules.trim()) {
      setError('Tournament rules are required');
      return false;
    }

    return true;
  };

  const handleCreateTournament = async () => {
    if (!validateForm() || !user) return;

    setError('');
    setLoading(true);

    try {
      const tournament = await createTournament(
        {
          name: name.trim(),
          photoURL,
          location: location.trim(),
          dateTime,
          format,
          numberOfTeams,
          rules: rules.trim(),
        },
        user.id
      );

      // Navigate to tournament detail page
      navigation.replace('TournamentDetail', { tournamentId: tournament.id });
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tournament Photo */}
        <View style={styles.section}>
          <Text style={styles.label}>Tournament Photo *</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>
                  Tap to select photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tournament Name */}
        <View style={styles.section}>
          <TextInput
            label="Tournament Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            disabled={loading}
            placeholder="e.g., Summer Padel Championship"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <TextInput
            label="Location/Club *"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            style={styles.input}
            disabled={loading}
            placeholder="e.g., Padel Club Downtown"
          />
        </View>

        {/* Date and Time */}
        <View style={styles.section}>
          <Text style={styles.label}>Date and Time *</Text>
          <View style={styles.dateTimeContainer}>
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateTimeButton}
              disabled={loading}
            >
              {dateTime.toLocaleDateString()}
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowTimePicker(true)}
              style={styles.dateTimeButton}
              disabled={loading}
            >
              {dateTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Button>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dateTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Tournament Format */}
        <View style={styles.section}>
          <Text style={styles.label}>Tournament Format *</Text>
          {TOURNAMENT_FORMATS.map((formatOption) => (
            <Button
              key={formatOption.value}
              mode={format === formatOption.value ? 'contained' : 'outlined'}
              onPress={() => setFormat(formatOption.value)}
              style={styles.formatButton}
              disabled={!formatOption.enabled || loading}
            >
              {formatOption.label}
              {formatOption.comingSoon && ' (Coming Soon)'}
            </Button>
          ))}
        </View>

        {/* Number of Teams */}
        <View style={styles.section}>
          <Text style={styles.label}>Number of Teams *</Text>
          <Menu
            visible={teamsMenuVisible}
            onDismiss={() => setTeamsMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setTeamsMenuVisible(true)}
                style={styles.input}
                disabled={loading}
              >
                {numberOfTeams} Teams
              </Button>
            }
          >
            {TEAM_COUNT_OPTIONS.map((count) => (
              <Menu.Item
                key={count}
                onPress={() => {
                  setNumberOfTeams(count);
                  setTeamsMenuVisible(false);
                }}
                title={`${count} Teams`}
              />
            ))}
          </Menu>
        </View>

        {/* Tournament Rules */}
        <View style={styles.section}>
          <TextInput
            label="Tournament Rules *"
            value={rules}
            onChangeText={setRules}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
            disabled={loading}
            placeholder="Describe the rules and format details..."
          />
        </View>

        {error ? (
          <HelperText type="error" visible={!!error} style={styles.error}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleCreateTournament}
          style={styles.createButton}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : 'Create Tournament'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  textArea: {
    minHeight: 100,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
  },
  formatButton: {
    marginBottom: 8,
  },
  error: {
    marginBottom: 12,
  },
  createButton: {
    marginTop: 8,
    marginBottom: 32,
    paddingVertical: 6,
  },
});
