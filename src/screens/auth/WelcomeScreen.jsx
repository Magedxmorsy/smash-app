import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Button from '../../components/ui/Button';
import SmashLogoLight from '../../../assets/branding/smash-logo-light.svg';

export default function WelcomeScreen({ onGetStarted }) {
  return (
    <ImageBackground
      source={require('../../../assets/branding/landingpagebg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <SmashLogoLight width={200} height={60} />
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>
            Create padel tournaments instantly, invite friends and let the app handle the rest
          </Text>
        </View>

        {/* CTA Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Get started"
            onPress={onGetStarted}
            variant="accent"
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.space4,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  taglineContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  tagline: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body100,
    color: Colors.surface,
    textAlign: 'center',
    lineHeight: Typography.body100 * 1.2,
    maxWidth: '80%',
  },
  buttonContainer: {
    width: '100%',
  },
});
