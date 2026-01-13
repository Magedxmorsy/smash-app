import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { checkEmailExists } from '../../services/authService';
import CloseDarkIcon from '../../../assets/icons/closedark.svg';

export default function LoginScreen({ onNavigateToSignUp, onClose, onEmailSubmit, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const emailInputRef = useRef(null);
  const { signIn } = useAuth();

  useEffect(() => {
    // Auto-focus email field after a short delay
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    // Clear previous errors
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Please enter your email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Check if email exists
    const { exists, error } = await checkEmailExists(email);

    console.log('🔍 Email check result:', { email, exists, error });

    setIsLoading(false);

    if (error) {
      setEmailError(error);
      return;
    }

    if (exists) {
      // Existing user - show password field
      console.log('✅ Existing user - showing password field');
      setShowPasswordField(true);
    } else {
      // New user - navigate to verification screen
      console.log('🆕 New user - navigating to signup flow');
      if (onEmailSubmit) {
        onEmailSubmit(email, true); // true = new user
      }
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setPasswordError('');

    if (!password.trim()) {
      setPasswordError('Please enter your password');
      return;
    }

    setIsLoading(true);
    const { success, error } = await signIn(email, password);
    setIsLoading(false);

    if (!success) {
      // Display user-friendly error message
      if (error.includes('invalid-credential') || error.includes('Invalid email or password')) {
        setPasswordError('Invalid email or password');
      } else {
        setPasswordError(error || 'An error occurred');
      }
    } else {
      // Close modal on successful login
      if (onClose) {
        onClose();
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
            <Text style={styles.title}>Let's smash</Text>
            <Text style={styles.subtitle}>Login or sign up</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              ref={emailInputRef}
              label="Email"
              placeholder="e.g. name@proton.me"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(''); // Clear error when user types
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              variant="light"
              editable={!showPasswordField}
              error={emailError}
            />

{showPasswordField && (
              <>
                <View style={styles.passwordContainer}>
                  <View style={styles.passwordHeader}>
                    <Text style={styles.passwordLabel}>Password</Text>
                    <TouchableOpacity onPress={onForgotPassword}>
                      <Text style={styles.resetPassword}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>
                  <Input
                    placeholder="Choose password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError(''); // Clear error when user types
                    }}
                    secureTextEntry={!showPassword}
                    variant="light"
                    showPasswordToggle={true}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    error={passwordError}
                  />
                </View>
              </>
            )}

            <View style={styles.buttonGroup}>
              <Button
                title={showPasswordField ? 'Login' : 'Continue'}
                onPress={showPasswordField ? handleLogin : handleContinue}
                variant="primary"
                loading={isLoading}
              />

              {showPasswordField && (
                <Button
                  title="Create new account"
                  onPress={onNavigateToSignUp}
                  variant="ghost"
                />
              )}
            </View>
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
  buttonGroup: {
    gap: Spacing.space2,
  },
  passwordContainer: {
    gap: Spacing.space2,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  resetPassword: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral400,
  },
});
