import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import TextArea from '../../components/ui/TextArea';
import { useTournamentForm } from '../../contexts/TournamentFormContext';
import { Spacing } from '../../constants/Spacing';

export default function RulesFormScreenV2({ onSetHeaderRight }) {
  const { rules, setRules } = useTournamentForm();
  const [tempRules, setTempRules] = React.useState(rules);

  React.useEffect(() => {
    // Notify parent to show save button
    if (onSetHeaderRight) {
      onSetHeaderRight(() => handleSave);
    }
  }, [tempRules]);

  const handleSave = () => {
    setRules(tempRules);
    return true; // Signal that save was successful
  };

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
    paddingBottom: Spacing.space8,
  },
});
