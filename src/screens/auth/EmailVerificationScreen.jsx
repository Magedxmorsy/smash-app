import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Button from '../../components/ui/Button';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function EmailVerificationScreen({ email, onVerifySuccess, onResendCode, onBack }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);

    // Call the verification function passed from parent
    const success = await onVerifySuccess(verificationCode);

    setIsVerifying(false);

    if (success) {
      // Trigger haptic feedback on success
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Clear the code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return; // Don't allow resend during countdown

    setIsResending(true);
    await onResendCode();
    setIsResending(false);
    setCountdown(30); // Reset countdown

    // Clear the code
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      {/* Swipe Handle */}
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
            <Text style={styles.subtitle}>Enter the code we sent you</Text>
          </View>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          <Button
            title={isVerifying ? 'Verifying...' : 'Verify'}
            onPress={handleVerify}
            variant="primary"
            disabled={isVerifying || code.join('').length !== 6}
          />

          <View style={styles.resendContainer}>
            {countdown > 0 ? (
              <Text style={styles.resendText}>
                Send another code? <Text style={styles.countdown}>{countdown} seconds</Text>
              </Text>
            ) : (
              <Text style={styles.resendText}>
                Send another code?{' '}
                <Text style={styles.resendLink} onPress={handleResend}>
                  {isResending ? 'Sending...' : 'Resend now'}
                </Text>
              </Text>
            )}
          </View>
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.space6,
    gap: Spacing.space2,
  },
  codeInput: {
    flex: 1,
    height: 80,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline200,
    color: Colors.primary300,
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: Colors.primary300,
    backgroundColor: Colors.surface,
  },
  resendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.space4,
  },
  resendText: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body200,
    color: Colors.primary300,
    textAlign: 'center',
  },
  countdown: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  resendLink: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
});
