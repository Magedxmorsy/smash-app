import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Avatar from '../ui/Avatar';
import Input from '../ui/Input';
import Button from '../ui/Button';
import LinkButton from '../ui/LinkButton';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useAuth } from '../../contexts/AuthContext';
import CloseIcon from '../../../assets/icons/close.svg';

export default function EditProfileModal({ visible, onClose }) {
  const { userData, updateUserData } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const insets = useSafeAreaInsets();

  // Pre-fill form with current user data when modal opens
  useEffect(() => {
    if (visible && userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setAvatarUri(userData.avatarUri || null);
    }
  }, [visible, userData]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to change your profile photo.',
          [{ text: 'OK', style: 'cancel' }]
        );
        return;
      }

      // Launch image picker WITHOUT built-in editor on Android to avoid UI issues
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS === 'ios', // Only use built-in editor on iOS
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];

        // For Android, use expo-image-manipulator to crop programmatically
        if (Platform.OS === 'android') {
          // Calculate center square crop
          const { width, height } = selectedImage;
          const size = Math.min(width, height);
          const originX = (width - size) / 2;
          const originY = (height - size) / 2;

          const manipResult = await ImageManipulator.manipulateAsync(
            selectedImage.uri,
            [
              { crop: { originX, originY, width: size, height: size } },
              { resize: { width: 400, height: 400 } }
            ],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );

          setAvatarUri(manipResult.uri);
        } else {
          // iOS: use the already-edited image
          setAvatarUri(selectedImage.uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your last name');
      return;
    }

    setIsSaving(true);

    try {
      // Update user data
      if (updateUserData) {
        const result = await updateUserData({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          avatarUri: avatarUri,
        });

        if (result.success) {
          // Dismiss modal on success
          onClose();
        } else {
          Alert.alert('Error', result.error || 'Failed to update profile. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalWrapper}>
        <View style={styles.container}>
          {/* Swipe Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
              <CloseIcon width={32} height={32} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit profile</Text>
            <View style={styles.headerIcon} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                <Avatar
                  size="large"
                  source={avatarUri}
                  name={`${firstName} ${lastName}`}
                />
              </TouchableOpacity>
              <LinkButton
                title="Change photo"
                onPress={pickImage}
                variant="neutral"
              />
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <Input
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                autoCapitalize="words"
              />
              <Input
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                autoCapitalize="words"
              />
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + (Platform.OS === 'android' ? 24 : 0) }]}>
            <Button
              title="Save changes"
              onPress={handleSave}
              variant="primary"
              loading={isSaving}
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    ...Platform.select({
      android: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
        justifyContent: 'flex-end',
      },
    }),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space2,
    ...Platform.select({
      android: {
        borderTopLeftRadius: BorderRadius.radius6,
        borderTopRightRadius: BorderRadius.radius6,
        overflow: 'hidden',
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.space2,
    paddingBottom: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
    marginHorizontal: -Spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body100,
    color: Colors.primary300,
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space2,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.space6,
  },
  avatarContainer: {
    marginBottom: Spacing.space2,
  },
  formSection: {
    gap: Spacing.space4,
  },
  buttonContainer: {
    paddingTop: Spacing.space4,
  },
});
