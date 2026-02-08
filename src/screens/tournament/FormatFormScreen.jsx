import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardGroup from '../../components/ui/CardGroup';
import { useTournamentForm } from '../../contexts/TournamentFormContext';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function FormatFormScreen({ onNavigate, onSave }) {
  const insets = useSafeAreaInsets();
  const { format, setFormat } = useTournamentForm();
  const [tempFormat, setTempFormat] = React.useState(format);

  const handleSave = React.useCallback(() => {
    setFormat(tempFormat);
    onNavigate('main', 'back');
  }, [tempFormat, setFormat, onNavigate]);

  // Expose handleSave to parent via onSave callback
  React.useEffect(() => {
    if (onSave) {
      onSave(handleSave);
    }
  }, [handleSave, onSave]);

  const formatOptions = [
    {
      value: 'World cup',
      title: 'World cup',
      subtitle: 'Group stage followed by knockout rounds',
      enabled: true,
    },
    {
      value: 'Round Robin',
      title: 'Round Robin (Coming soon)',
      subtitle: 'Every team plays against each other',
      enabled: false,
    },
    {
      value: 'King of the court',
      title: 'King of the court (Coming soon)',
      subtitle: 'Winner stays, loser rotates',
      enabled: false,
    },
  ];

  const handleSelectFormat = (value, enabled) => {
    if (enabled) {
      setTempFormat(value);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <CardGroup>
        {formatOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleSelectFormat(option.value, option.enabled)}
            disabled={!option.enabled}
            style={[
              styles.optionContainer,
              !option.enabled && styles.optionDisabled,
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.optionTitle,
                    !option.enabled && styles.textDisabled,
                  ]}
                >
                  {option.title}
                </Text>
                <Text
                  style={[
                    styles.optionSubtitle,
                    !option.enabled && styles.textDisabled,
                  ]}
                >
                  {option.subtitle}
                </Text>
              </View>
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    tempFormat === option.value && option.enabled && styles.radioOuterSelected,
                    !option.enabled && styles.radioDisabled,
                  ]}
                >
                  {tempFormat === option.value && option.enabled && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </CardGroup>
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
  optionContainer: {
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space4,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.space3,
  },
  optionTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginBottom: Spacing.space1,
  },
  optionSubtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body200,
    color: Colors.neutral400,
    lineHeight: Typography.body200 * 1.5,
  },
  textDisabled: {
    color: Colors.neutral400,
  },
  radioContainer: {
    padding: Spacing.space1,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  radioOuterSelected: {
    borderColor: Colors.primary300,
  },
  radioDisabled: {
    borderColor: Colors.neutral300,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary300,
  },
});
