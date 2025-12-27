import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';
import CloseIcon from '../../../assets/icons/closedark.svg';

export default function ProfileSetupScreen({ onProfileComplete, onBack }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to select a photo.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const removeAvatar = () => {
    setAvatarUri(null);
  };

  const handleCreateAccount = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    setIsLoading(true);
    await onProfileComplete({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      avatarUri: avatarUri,
    });
    setIsLoading(false);
  };

  const isValid = firstName.trim() && lastName.trim();

  return (
    <View style={styles.container}>
      {/* Swipe Indicator */}
      <View style={styles.swipeIndicator} />

      {/* Back Button */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ChevronLeftIcon width={24} height={24} color={Colors.primary300} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              {avatarUri || firstName || lastName ? 'Tell us about yourself' : 'Complete your player profile'}
            </Text>
          </View>

          {/* Avatar Selection */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              {avatarUri ? (
                <>
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      removeAvatar();
                    }}
                  >
                    <CloseIcon width={44} height={44} color={Colors.primary300} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <View style={styles.plusIcon}>
                    <View style={styles.plusHorizontal} />
                    <View style={styles.plusVertical} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.avatarLabel}>
                {avatarUri ? 'Edit photo' : 'Add photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Name Inputs */}
          <View style={styles.form}>
            <Input
              label="First name"
              placeholder="e.g. Yaya"
              value={firstName}
              onChangeText={setFirstName}
              variant="light"
              autoCapitalize="words"
            />

            <Input
              label="Last name"
              placeholder="e.g. Rawnis"
              value={lastName}
              onChangeText={setLastName}
              variant="light"
              autoCapitalize="words"
            />
          </View>

          <Button
            title={isLoading ? 'Creating account...' : 'Create account'}
            onPress={handleCreateAccount}
            variant="primary"
            disabled={isLoading || !isValid}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space2,
    gap: 8,
  },
  backText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 16,
    color: Colors.primary300,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Spacing.space3,
    paddingBottom: Spacing.space4,
  },
  header: {
    marginBottom: Spacing.space8,
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline400,
    color: Colors.primary300,
    marginBottom: Spacing.space2,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.5,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.space8,
  },
  avatarContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: Spacing.space3,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    backgroundColor: Colors.neutral100,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusHorizontal: {
    position: 'absolute',
    width: 48,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
  plusVertical: {
    position: 'absolute',
    width: 4,
    height: 48,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral300,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarLabel: {
    fontFamily: 'GeneralSans-semibold',
    fontSize: Typography.button,
    color: Colors.primary300,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.space4,
    marginBottom: Spacing.space6,
  },
});
