import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import TextArea from '../../components/ui/TextArea';
import { useTournamentForm } from '../../contexts/TournamentFormContext';
import { Spacing } from '../../constants/Spacing';
import CheckIcon from '../../../assets/icons/check.svg';

export default function RulesFormScreen({ onNavigate, navigation }) {
  const insets = useSafeAreaInsets();
  const { rules, setRules } = useTournamentForm();
  const [tempRules, setTempRules] = React.useState(rules);

  // Auto-save rules when component unmounts (when navigating away)
  React.useEffect(() => {
    return () => {
      setRules(tempRules);
    };
  }, [tempRules, setRules]);

  const handleSave = () => {
    setRules(tempRules);
    onNavigate('main');
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
    paddingBottom: Spacing.space4,
  },
});
