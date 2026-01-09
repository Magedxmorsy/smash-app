import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { checkEmailExists } from '../../services/authService';
import CloseDarkIcon from '../../../assets/icons/closedark.svg';

export default function SignUpScreen({ onNavigateToLogin, onClose, onEmailSubmit }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef(null);

  useEffect(() => {
    // Auto-focus email field after a short delay
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
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

    // Check if email exists
    const { exists, error } = await checkEmailExists(email);

    console.log('🔍 SignUp - Email check result:', { email, exists, error });

    setIsLoading(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    if (exists) {
      // Email already registered - show alert and suggest login
      Alert.alert(
        'Email already registered',
        'This email is already registered. Would you like to sign in instead?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Sign in',
            onPress: () => onNavigateToLogin && onNavigateToLogin()
          }
        ]
      );
    } else {
      // New user - proceed with sign-up flow
      console.log('🆕 New user - starting verification flow');
      if (onEmailSubmit) {
        onEmailSubmit(email, true); // true = new user
      }
    }
  };

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
            <Text style={styles.subtitle}>Sign up to get started</Text>
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
              title={isLoading ? 'Please wait...' : 'Continue'}
              onPress={handleContinue}
              variant="primary"
              disabled={isLoading}
            />

            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.signInText}>
                Already have an account? <Text style={styles.signInLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>
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
  },
  form: {
    gap: Spacing.space4,
  },
  signInText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral400,
    textAlign: 'center',
  },
  signInLink: {
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.primary300,
  },
});
