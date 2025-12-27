import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FullScreenModal from '../ui/FullScreenModal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useAuth } from '../../contexts/AuthContext';
import ChangeIcon from '../../../assets/icons/change.svg';

export default function EditProfileModal({ visible, onClose }) {
  const { userData, updateUserData } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
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

  const getInitials = () => {
    if (!firstName && !lastName) return '?';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
    >
      <View style={styles.container}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.initials}>{getInitials()}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            <ChangeIcon width={24} height={24} color={Colors.neutral400} />
            <Text style={styles.changePhotoText}>Change photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Input
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            autoCapitalize="words"
          />
          <Input
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            autoCapitalize="words"
          />
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isSaving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            variant="primary"
            disabled={isSaving}
            fullWidth
          />
        </View>
      </View>
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.space4,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.space6,
  },
  avatarContainer: {
    marginBottom: Spacing.space2,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.neutral200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline200,
    color: Colors.primary300,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space1,
  },
  changePhotoText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.neutral400,
  },
  formSection: {
    gap: Spacing.space4,
    marginBottom: Spacing.space6,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
});
