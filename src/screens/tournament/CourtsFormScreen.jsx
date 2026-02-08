import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import CardGroup from '../../components/ui/CardGroup';
import ListItem from '../../components/ui/ListItem';
import LinkButton from '../../components/ui/LinkButton';
import { useTournamentForm } from '../../contexts/TournamentFormContext';
import { Spacing } from '../../constants/Spacing';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import TrashIcon from '../../../assets/icons/trash.svg';
import PlusIcon from '../../../assets/icons/plus.svg';
import CheckIcon from '../../../assets/icons/check.svg';

export default function CourtsFormScreen({ onNavigate, navigation, editMode = false, onSave }) {
  console.log('🏟️ CourtsFormScreen mounted', { editMode });
  const insets = useSafeAreaInsets();
  const { courtNumbers, setCourtNumbers } = useTournamentForm();

  const [tempCourtFields, setTempCourtFields] = React.useState(() => {
    if (courtNumbers) {
      return courtNumbers.split(',').map((c, i) => ({
        id: i + 1,
        value: c.trim()
      }));
    }
    return [
      { id: 1, value: '' },
      { id: 2, value: '' },
      { id: 3, value: '' },
    ];
  });

  const handleSave = React.useCallback(() => {
    // Validation for Edit Mode: No empty fields allowed (would reduce count)
    if (editMode) {
      const hasEmptyFields = tempCourtFields.some(field => field.value.trim() === '');
      if (hasEmptyFields) {
        Alert.alert('Invalid Court Name', 'Court names cannot be empty when editing.');
        return;
      }
    }

    const courtValues = tempCourtFields
      .filter(field => field.value.trim() !== '')
      .map(field => field.value.trim())
      .join(', ');

    setCourtNumbers(courtValues);
    onNavigate('main', 'back');
  }, [tempCourtFields, setCourtNumbers, onNavigate, editMode]);

  // Expose handleSave to parent via onSave callback
  React.useEffect(() => {
    if (onSave) {
      onSave(handleSave);
    }
  }, [handleSave, onSave]);

  const handleAddCourtField = () => {
    const newId = Math.max(...tempCourtFields.map(f => f.id), 0) + 1;
    setTempCourtFields([...tempCourtFields, { id: newId, value: '' }]);
  };

  const handleRemoveCourtField = (id) => {
    if (tempCourtFields.length > 1) {
      setTempCourtFields(tempCourtFields.filter(f => f.id !== id));
    }
  };

  const handleCourtFieldChange = (id, value) => {
    setTempCourtFields(tempCourtFields.map(f =>
      f.id === id ? { ...f, value } : f
    ));
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <CardGroup>
        {tempCourtFields.map((field, index) => (
          <ListItem
            key={field.id}
            editable={true}
            placeholder={`Court ${index + 1}`}
            value={field.value}
            onChangeText={(value) => handleCourtFieldChange(field.id, value)}
            keyboardType="default"
            showChevron={false}
            rightComponent={
              tempCourtFields.length > 1 && !editMode ? (
                <TouchableOpacity
                  onPress={() => handleRemoveCourtField(field.id)}
                  style={styles.removeButton}
                >
                  <TrashIcon width={24} height={24} />
                </TouchableOpacity>
              ) : null
            }
          />
        ))}

        {!editMode && (
          <LinkButton
            title="Add another court"
            icon={<PlusIcon />}
            variant="neutral"
            onPress={handleAddCourtField}
            style={styles.addCourtButton}
          />
        )}
      </CardGroup>

      <Text style={styles.courtHint}>
        {editMode
          ? 'You can edit court names, but cannot add or remove courts after tournament creation.'
          : 'Enter court numbers or names. You can use numbers (e.g., "2"), names (e.g., "Court A"), or custom labels.'}
      </Text>
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
  removeButton: {
    width: Spacing.iconSize,
    height: Spacing.iconSize,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.space2,
  },
  addCourtButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.space6,
  },
  courtHint: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body300,
    color: Colors.neutral400,
    textAlign: 'center',
    lineHeight: Typography.body300 * 1.5,
    paddingHorizontal: Spacing.space2,
    marginTop: Spacing.space4,
  },
});
