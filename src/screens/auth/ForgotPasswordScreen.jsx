import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { resetPassword } from '../../services/authService';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';
import CloseDarkIcon from '../../../assets/icons/closedark.svg';

export default function ForgotPasswordScreen({ onBack, onClose }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const emailInputRef = useRef(null);

  useEffect(() => {
    // Auto-focus email field after a short delay
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Send password reset email
    const { success, error } = await resetPassword(email);

    setIsLoading(false);

    if (success) {
      // Show success state
      setEmailSent(true);
    } else {
      Alert.alert('Error', error || 'Failed to send reset email. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    if (onBack) {
      onBack();
    }
  };

  // Success state
  if (emailSent) {
    return (
      <View style={styles.container}>
        {/* Fixed Swipe Indicator */}
        <View style={styles.swipeIndicator} />

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

        <View style={styles.successContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent you a reset password link to your registered email
            </Text>
          </View>

          <Button
            title="Back to login"
            onPress={handleBackToLogin}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  // Email input state
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
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              ref={emailInputRef}
              label="Email"
              placeholder="e.g. name@proton.me"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              variant="light"
            />

            <Button
              title={isLoading ? 'Sending...' : 'Send reset link'}
              onPress={handleSendResetLink}
              variant="primary"
              disabled={isLoading}
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
    paddingTop: Spacing.space8,
    paddingBottom: Spacing.space4,
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Spacing.space8,
    justifyContent: 'space-between',
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
    top: 16,
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
});
