import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Button from '../../components/ui/Button';
import { resendVerificationEmail, checkEmailVerificationStatus } from '../../services/authService';
import CloseDarkIcon from '../../../assets/icons/closedark.svg';

export default function EmailVerificationPendingScreen({ email, onVerified, onClose }) {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    console.log('🔄 Attempting to resend verification email...');
    const { success, error } = await resendVerificationEmail();
    setIsResending(false);

    console.log('📧 Resend result:', { success, error });

    if (success) {
      Alert.alert('Email Sent', 'Verification email has been sent to ' + email);
    } else {
      console.error('❌ Resend email error:', error);
      Alert.alert('Error', error || 'Failed to send verification email');
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    const { verified, error } = await checkEmailVerificationStatus();
    setIsChecking(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    if (verified) {
      // Email is verified, proceed to app
      if (onVerified) {
        onVerified();
      }
    } else {
      Alert.alert(
        'Not Verified Yet',
        'Please check your email and click the verification link. It may take a few moments to process.',
        [
          { text: 'OK' },
          {
            text: 'Resend Email',
            onPress: handleResendEmail
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Swipe Indicator */}
      <View style={styles.swipeIndicator} />

      {/* Close Button */}
      {onClose && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CloseDarkIcon width={32} height={32} color={Colors.neutral300} />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Image
          source={require('../../../assets/emailverification.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a verification link to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
          <Text style={styles.instructions}>
            Click the link in the email to verify your account and continue.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title={isChecking ? 'Checking...' : "I've verified my email"}
          onPress={handleCheckVerification}
          variant="primary"
          fullWidth={true}
          disabled={isChecking || isResending}
        />

        <Button
          title={isResending ? 'Sending...' : "Didn't receive the email? Resend"}
          onPress={handleResendEmail}
          variant="ghost"
          fullWidth={true}
          disabled={isResending || isChecking}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.space6,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: Spacing.space6,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.space10,
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline300,
    color: Colors.primary400,
    textAlign: 'center',
    marginBottom: Spacing.space5,
    lineHeight: Typography.headline300 * Typography.lineHeightHeadline,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body100,
    color: Colors.primary300,
    textAlign: 'center',
    lineHeight: Typography.body100 * Typography.lineHeightBody,
    marginBottom: Spacing.space4,
  },
  email: {
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.primary400,
  },
  instructions: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    textAlign: 'center',
    lineHeight: Typography.body200 * Typography.lineHeightBody,
  },
  actions: {
    gap: Spacing.space2,
    paddingBottom: Spacing.space6,
  },
});
