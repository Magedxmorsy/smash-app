import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function CreatePasswordScreen({ onPasswordCreated, onBack }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleContinue = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    setIsLoading(true);
    await onPasswordCreated(password);
    setIsLoading(false);
  };

  const isValid = password.length >= 6 && password === confirmPassword;

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
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Choose a password</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Password"
              placeholder="Choose password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              variant="light"
              showPasswordToggle={true}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            <Input
              label="Confirm password"
              placeholder="Type your password again"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              variant="light"
              showPasswordToggle={true}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </View>

          <Button
            title={isLoading ? 'Creating account...' : 'Continue'}
            onPress={handleContinue}
            variant="primary"
            disabled={isLoading || !isValid}
          />
        </View>
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
  content: {
    flex: 1,
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
  form: {
    gap: Spacing.space4,
    marginBottom: Spacing.space6,
  },
});
