import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform, LayoutAnimation, UIManager } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import CardGroup from '../../components/ui/CardGroup';
import ListItem from '../../components/ui/ListItem';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';
import { submitFeedback } from '../../services/feedbackService';

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General Feedback' }
];

export default function FeedbackScreen({ navigation }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'bug',
    subject: '',
    message: '',
    email: user?.email || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = 'Please select a feedback type';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please enter a subject';
    } else if (formData.subject.length > 100) {
      newErrors.subject = 'Subject must be less than 100 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message';
    } else if (formData.message.length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitFeedback({
        ...formData,
        userId: user?.uid
      });

      if (result.success) {
        Alert.alert(
          'Thank You!',
          'Your feedback has been submitted successfully. We appreciate your input!',
          [
            {
              text: 'Submit More',
              onPress: () => {
                setFormData({
                  type: 'bug',
                  subject: '',
                  message: '',
                  email: user?.email || ''
                });
                setErrors({});
              }
            },
            {
              text: 'Done',
              onPress: () => navigation.goBack(),
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeLabel = FEEDBACK_TYPES.find(type => type.value === formData.type)?.label;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeftIcon width={32} height={32} color={Colors.primary300} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Send Feedback</Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* All Forms in One Card */}
        <CardGroup>
          {/* Feedback Type */}
          <View>
            <ListItem
              placeholder="Feedback Type"
              value={selectedTypeLabel}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowTypePicker(!showTypePicker);
              }}
              error={errors.type}
            />

            {showTypePicker && Platform.OS === 'ios' && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(itemValue) => {
                    handleInputChange('type', itemValue);
                  }}
                  itemStyle={styles.pickerItem}
                >
                  {FEEDBACK_TYPES.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          {/* Subject */}
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.subject && styles.inputError]}
                placeholder="Subject"
                placeholderTextColor={Colors.neutral400}
                value={formData.subject}
                onChangeText={(value) => handleInputChange('subject', value)}
                maxLength={100}
              />
            </View>
            {errors.subject && (
              <Text style={styles.errorText}>{errors.subject}</Text>
            )}
          </View>

          {/* Message */}
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea, errors.message && styles.inputError]}
                placeholder="Tell us more about your feedback..."
                placeholderTextColor={Colors.neutral400}
                value={formData.message}
                onChangeText={(value) => handleInputChange('message', value)}
                multiline
                numberOfLines={5}
                maxLength={1000}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {formData.message.length}/1000
              </Text>
            </View>
            {errors.message && (
              <Text style={styles.errorText}>{errors.message}</Text>
            )}
          </View>

          {/* Email */}
          <View>
            <View style={styles.inputContainer}>
              <Text style={styles.emailLabel}>Reply to</Text>
              <TextInput
                style={[styles.input, styles.emailInput, errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor={Colors.neutral400}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>
        </CardGroup>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isSubmitting ? "Submitting..." : "Submit Feedback"}
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space8,
    gap: Spacing.space4,
  },
  pickerContainer: {
    paddingHorizontal: Spacing.space4,
    backgroundColor: Colors.surface,
  },
  pickerItem: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  inputContainer: {
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space4,
  },
  input: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    padding: 0,
    minHeight: Spacing.iconSize,
  },
  textArea: {
    minHeight: 120,
    marginTop: Spacing.space1,
  },
  emailLabel: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body300,
    color: Colors.neutral400,
    marginBottom: Spacing.space2,
  },
  emailInput: {
    marginTop: 0,
  },
  inputError: {
    color: Colors.error,
  },
  errorText: {
    fontSize: Typography.body300,
    fontFamily: 'GeneralSans-Medium',
    color: Colors.error,
    marginTop: Spacing.space1,
    lineHeight: Typography.body300 * 1.5,
  },
  characterCount: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body300,
    color: Colors.neutral400,
    textAlign: 'right',
    marginTop: Spacing.space1,
  },
  buttonContainer: {
    marginTop: Spacing.space4,
  },
});