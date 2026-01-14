import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';
import CloseDarkIcon from '../../../assets/icons/closedark.svg';

export default function CreateAccountScreen({ email, onBack, onClose, onAccountCreated }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    // Auto-focus password field after a short delay
    const timer = setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleCreateAccount = async () => {
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Invalid Password', passwordError);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    // Call the parent handler with email and password
    if (onAccountCreated) {
      await onAccountCreated(email, password);
    }

    setIsLoading(false);
  };

  const isValid = password.length >= 8 && confirmPassword.length >= 8;

  return (
    <View style={styles.container}>
      {/* Fixed Swipe Indicator */}
      <View style={styles.swipeIndicator} />

      {/* Back Button */}
      {onBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeftIcon width={24} height={24} color={Colors.primary300} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}

      {/* Fixed Close Button */}
      {onClose && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CloseDarkIcon width={32} height={32} color={Colors.neutral300} />
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Text */}
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Create a password for {email}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              ref={passwordInputRef}
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              variant="light"
              showPasswordToggle={true}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            <Input
              label="Confirm password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              variant="light"
              showPasswordToggle={true}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <Text style={styles.requirements}>
              Password must be at least 8 characters and contain uppercase, lowercase, and numbers
            </Text>

            <Button
              title={isLoading ? 'Creating account...' : 'Create account'}
              onPress={handleCreateAccount}
              variant="primary"
              disabled={isLoading || !isValid}
            />
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72, // 56px (back button height) + 16px spacing
    paddingBottom: Spacing.space4,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
    position: 'absolute',
    top: 12,
    left: '50%',
    marginLeft: -20,
    zIndex: 20,
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  backText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 16,
    color: Colors.primary300,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
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
  form: {
    gap: Spacing.space4,
  },
  requirements: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 13,
    color: Colors.neutral400,
    lineHeight: 13 * 1.5,
    marginTop: -Spacing.space2,
  },
});
