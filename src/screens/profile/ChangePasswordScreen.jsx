import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { changePassword, resetPassword } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LinkButton from '../../components/ui/LinkButton';

import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function ChangePasswordScreen({ navigation }) {
  const { userData } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords must match', 'error');
      return;
    }

    if (currentPassword === newPassword) {
      showToast('New password must be different from current password', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword(currentPassword, newPassword);

      if (result.success) {
        showToast('Password changed successfully', 'success');
        navigation.goBack();
      } else {
        showToast(result.error, 'error');
      }
    } catch (error) {
      console.error('Change password error:', error);
      showToast('An error occurred. Please try again', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!userData?.email) {
      showToast('User email not found', 'error');
      return;
    }

    try {
      const result = await resetPassword(userData.email);
      if (result.success) {
        showToast('Password reset email sent', 'success');
      } else {
        showToast(result.error, 'error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showToast('An error occurred. Please try again', 'error');
    }
  };

  const isValid =
    currentPassword.length >= 6 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword &&
    currentPassword !== newPassword;

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

        <Text style={styles.headerTitle}>Change password</Text>

        {/* Empty view to balance the layout */}
        <View style={styles.headerButton} />
      </View>

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
          <View style={styles.form}>
            <View>
              <Input
                label="Current password"
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                variant="light"
                showPasswordToggle={true}
                onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
              />

              <View style={styles.forgotPasswordContainer}>
                <LinkButton
                  title="Forgot password?"
                  variant="primary"
                  spacing={0}
                  onPress={handleForgotPassword}
                />
              </View>
            </View>

            <Input
              label="New password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              variant="light"
              showPasswordToggle={true}
              onTogglePassword={() => setShowNewPassword(!showNewPassword)}
            />

            <Input
              label="Confirm new password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              variant="light"
              showPasswordToggle={true}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </View>

          <Button
            title="Change password"
            onPress={handleChangePassword}
            variant="primary"
            disabled={isLoading || !isValid}
            loading={isLoading}
            fullWidth
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space4,
  },
  form: {
    gap: Spacing.space4,
    marginBottom: Spacing.space6,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: Spacing.space4,
  },
});
