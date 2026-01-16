import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { useAuth } from '../../contexts/AuthContext';
import CardGroup from '../../components/ui/CardGroup';
import ListItem from '../../components/ui/ListItem';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Icons
import EmailIcon from '../../../assets/icons/email.svg';
import LockIcon from '../../../assets/icons/lock.svg';
import InfoIcon from '../../../assets/icons/info.svg';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function AccountSettingsScreen({ navigation }) {
  const { userData, deleteAccount } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEmailInfo = () => {
    Alert.alert(
      'Change email',
      'To change your email address, please contact Smash support at info@getsmash.net',
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleDeleteAccountPress = () => {
    Alert.alert(
      'Delete account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setShowDeleteModal(true);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleConfirmDelete = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password to confirm account deletion.');
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteAccount(password);

      if (result.success) {
        // Close modal
        setShowDeleteModal(false);
        setPassword('');

        // Show success message
        Alert.alert(
          'Account deleted',
          'Your account has been permanently deleted.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigation will be handled automatically by auth state change
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPassword('');
  };

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

        <Text style={styles.headerTitle}>Account</Text>

        {/* Empty view to balance the layout */}
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Account & Security */}
        <CardGroup>
          <ListItem
            icon={<EmailIcon width={24} height={24} />}
            value={userData?.email}
            showChevron={false}
            rightComponent={
              <TouchableOpacity onPress={handleEmailInfo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <InfoIcon width={24} height={24} />
              </TouchableOpacity>
            }
          />
          <ListItem
            icon={<LockIcon width={24} height={24} />}
            value="Change password"
            onPress={handleChangePassword}
            useChevronRight
          />
        </CardGroup>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccountPress}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteAccountButtonText}>Delete account</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={handleCancelDelete}
        onSwipeComplete={handleCancelDelete}
        swipeDirection="down"
        style={styles.modal}
        propagateSwipe={true}
        avoidKeyboard={true}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        coverScreen={true}
        useNativeDriver={true}
        statusBarTranslucent={true}
        backdropOpacity={0.5}
      >
        <View style={styles.modalContent}>
          {/* Swipe Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Modal Header */}
          <Text style={styles.modalTitle}>Confirm account deletion</Text>
          <Text style={styles.modalDescription}>
            Enter your password to permanently delete your account. This action cannot be undone.
          </Text>

          {/* Password Input */}
          <View style={styles.modalInputContainer}>
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
          </View>

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <Button
              title={isDeleting ? 'Deleting...' : 'Delete account'}
              onPress={handleConfirmDelete}
              variant="primary"
              fullWidth
              loading={isDeleting}
              style={styles.deleteButton}
            />
            <Button
              title="Cancel"
              onPress={handleCancelDelete}
              variant="ghost"
              fullWidth
              disabled={isDeleting}
            />
          </View>
        </View>
      </Modal>
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
    gap: Spacing.space6,
  },
  deleteAccountButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.radius4,
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Spacing.buttonHeightLarge,
  },
  deleteAccountButtonText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.button,
    color: Colors.error,
    lineHeight: Typography.button,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.radius6,
    borderTopRightRadius: BorderRadius.radius6,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.space2,
    paddingBottom: Spacing.space4,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
  modalTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    marginBottom: Spacing.space2,
  },
  modalDescription: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral400,
    lineHeight: Typography.body200 * 1.5,
    marginBottom: Spacing.space4,
  },
  modalInputContainer: {
    marginBottom: Spacing.space4,
  },
  modalButtons: {
    gap: Spacing.space2,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
});
