import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import TextArea from '../../components/ui/TextArea';
import { useTournamentForm } from '../../contexts/TournamentFormContext';
import { Spacing } from '../../constants/Spacing';
import CheckIcon from '../../../assets/icons/check.svg';

export default function RulesFormScreen({ onNavigate, navigation, onSave }) {
  const insets = useSafeAreaInsets();
  const { rules, setRules } = useTournamentForm();
  const [tempRules, setTempRules] = React.useState(rules);

  const handleSave = React.useCallback(() => {
    setRules(tempRules);
    onNavigate('main', 'back');
  }, [tempRules, setRules, onNavigate]);

  // Expose handleSave to parent via onSave callback
  React.useEffect(() => {
    if (onSave) {
      onSave(handleSave);
    }
  }, [handleSave, onSave]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TextArea
        placeholder="Enter custom rules (optional)"
        value={tempRules}
        onChangeText={setTempRules}
        numberOfLines={4}
        maxLength={500}
        hint="Add any special rules for your tournament"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space4,
  },
});
