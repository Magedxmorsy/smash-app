import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, Platform, Alert, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import CloseIcon from '../../../assets/icons/close.svg';

export default function RecordScoreModal({ visible, onClose, match, onSave }) {
  const insets = useSafeAreaInsets();
  const [teamAScores, setTeamAScores] = useState(['', '', '']);
  const [teamBScores, setTeamBScores] = useState(['', '', '']);

  // Refs for all inputs (6 total: 3 for Team A + 3 for Team B)
  const inputRefs = useRef([]);

  // Pre-fill scores when modal opens with existing match scores
  useEffect(() => {
    if (visible && match?.score) {
      const newTeamAScores = ['', '', ''];
      const newTeamBScores = ['', '', ''];

      match.score.forEach((set, index) => {
        if (index < 3) {
          newTeamAScores[index] = set.teamA.toString();
          newTeamBScores[index] = set.teamB.toString();
        }
      });

      setTeamAScores(newTeamAScores);
      setTeamBScores(newTeamBScores);
    } else if (visible) {
      // Reset to empty if no scores
      setTeamAScores(['', '', '']);
      setTeamBScores(['', '', '']);
    }
  }, [visible, match]);

  useEffect(() => {
    if (visible && inputRefs.current[0]) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [visible]);

  const handleScoreChange = (team, index, value, inputIndex) => {
    // Only allow single digit
    if (value.length > 1) return;

    if (team === 'A') {
      const newScores = [...teamAScores];
      newScores[index] = value;
      setTeamAScores(newScores);
    } else {
      const newScores = [...teamBScores];
      newScores[index] = value;
      setTeamBScores(newScores);
    }

    // Auto-advance to next input if a digit was entered
    // Order: A1 → B1 → A2 → B2 → A3 → B3
    // Mapping: 0 → 3, 3 → 1, 1 → 4, 4 → 2, 2 → 5
    if (value.length === 1) {
      const nextInputMap = {
        0: 3, // Team A Set 1 → Team B Set 1
        3: 1, // Team B Set 1 → Team A Set 2
        1: 4, // Team A Set 2 → Team B Set 2
        4: 2, // Team B Set 2 → Team A Set 3
        2: 5, // Team A Set 3 → Team B Set 3
      };

      const nextIndex = nextInputMap[inputIndex];
      if (nextIndex !== undefined) {
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const handleKeyPress = (e, team, index, inputIndex) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace') {
      const currentValue = team === 'A' ? teamAScores[index] : teamBScores[index];

      // If current input is empty, go back to previous input
      if (!currentValue) {
        const prevInputMap = {
          3: 0, // Team B Set 1 → Team A Set 1
          1: 3, // Team A Set 2 → Team B Set 1
          4: 1, // Team B Set 2 → Team A Set 2
          2: 4, // Team A Set 3 → Team B Set 2
          5: 2, // Team B Set 3 → Team A Set 3
        };

        const prevIndex = prevInputMap[inputIndex];
        if (prevIndex !== undefined) {
          inputRefs.current[prevIndex]?.focus();
        }
      }
    }
  };

  const handleSave = () => {
    // Convert to the format expected: array of {teamA, teamB} objects
    const formattedScores = [];
    for (let i = 0; i < 3; i++) {
      if (teamAScores[i] !== '' && teamBScores[i] !== '') {
        formattedScores.push({
          teamA: teamAScores[i],
          teamB: teamBScores[i],
        });
      }
    }

    // Validate at least 1 set is filled
    if (formattedScores.length < 1) {
      Alert.alert(
        'Incomplete Score',
        'Please fill at least 1 set to save the match score.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    onSave(formattedScores);
    onClose();
  };

  if (!match) return null;

  // Handle both leftTeam/rightTeam and team1/team2 property names
  const teamA = match.leftTeam || match.team1;
  const teamB = match.rightTeam || match.team2;

  if (!teamA || !teamB) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
      transparent={Platform.OS === 'android'}
      onRequestClose={onClose}
    >
      {Platform.OS === 'android' && <View style={styles.backdrop} />}
      <View style={styles.container}>
        {/* Swipe Indicator */}
        <View style={styles.swipeIndicator} />

        {/* Header with Close Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <CloseIcon width={32} height={32} />
          </TouchableOpacity>
          <Text style={styles.title}>Record match score</Text>
          <View style={styles.closeButton} />
        </View>

        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={20}
        >
          <Card style={styles.card}>
              {/* Team A Section */}
              <View style={styles.teamSection}>
                <View style={styles.teamRow}>
                  {/* Left: Team Label + Avatars */}
                  <View style={styles.teamInfoColumn}>
                    <Text style={styles.teamLabel}>Team A</Text>
                    <View style={styles.avatarsContainer}>
                      <Avatar
                        size="small"
                        name={`${teamA.player1.firstName} ${teamA.player1.lastName}`}
                      />
                      <Avatar
                        size="small"
                        name={`${teamA.player2.firstName} ${teamA.player2.lastName}`}
                      />
                    </View>
                  </View>

                  {/* Right: Score Inputs (horizontal) */}
                  <View style={styles.scoresRow}>
                    {teamAScores.map((score, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        style={styles.scoreInput}
                        value={score}
                        onChangeText={(value) => handleScoreChange('A', index, value, index)}
                        onKeyPress={(e) => handleKeyPress(e, 'A', index, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        placeholder="0"
                        placeholderTextColor={Colors.neutral300}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Team B Section */}
              <View style={styles.teamSection}>
                <View style={styles.teamRow}>
                  {/* Left: Team Label + Avatars */}
                  <View style={styles.teamInfoColumn}>
                    <Text style={styles.teamLabel}>Team B</Text>
                    <View style={styles.avatarsContainer}>
                      <Avatar
                        size="small"
                        name={`${teamB.player1.firstName} ${teamB.player1.lastName}`}
                      />
                      <Avatar
                        size="small"
                        name={`${teamB.player2.firstName} ${teamB.player2.lastName}`}
                      />
                    </View>
                  </View>

                  {/* Right: Score Inputs (horizontal) */}
                  <View style={styles.scoresRow}>
                    {teamBScores.map((score, index) => {
                      const inputIndex = 3 + index; // Team B starts at index 3
                      return (
                        <TextInput
                          key={index}
                          ref={(ref) => (inputRefs.current[inputIndex] = ref)}
                          style={styles.scoreInput}
                          value={score}
                          onChangeText={(value) => handleScoreChange('B', index, value, inputIndex)}
                          onKeyPress={(e) => handleKeyPress(e, 'B', index, inputIndex)}
                          keyboardType="number-pad"
                          maxLength={1}
                          placeholder="0"
                          placeholderTextColor={Colors.neutral300}
                        />
                      );
                    })}
                  </View>
                </View>
              </View>
            </Card>
          </KeyboardAwareScrollView>

          {/* Save Button - Fixed above keyboard */}
          <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
            <Button
              title="Save"
              variant="accent"
              size="large"
              onPress={handleSave}
            />
          </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: Spacing.space2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
    marginBottom: Spacing.space4,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.space4,
  },
  card: {
    padding: Spacing.space5,
    gap: Spacing.space4,
  },
  teamSection: {
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space4,
  },
  teamInfoColumn: {
    gap: Spacing.space2,
  },
  teamLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.neutral400,
    marginBottom: Spacing.space1,
  },
  avatarsContainer: {
    flexDirection: 'row',
    gap: Spacing.space2,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: Spacing.space2,
  },
  scoreInput: {
    width: 64,
    height: 64,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline300,
    color: Colors.primary300,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  footer: {
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space3,
    backgroundColor: Colors.background,
  },
});
