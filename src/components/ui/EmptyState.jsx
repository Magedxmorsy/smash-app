import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export default function EmptyState({ 
  imageSource, 
  headline, 
  body, 
  button 
}) {
  return (
    <View style={styles.container}>
      {/* Image/Icon */}
      <View style={styles.imageContainer}>
        {imageSource && (
          <Image 
            source={imageSource} 
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Headline */}
      <Text style={styles.headline}>{headline}</Text>

      {/* Body */}
      <Text style={styles.body}>{body}</Text>

      {/* CTA Button (optional) */}
      {button && (
        <View style={styles.buttonContainer}>
          {button}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.space8,
    maxWidth: 400,
    alignSelf: 'center',
  },
  imageContainer: {
    width: 214,
    height: 214,
    marginBottom: Spacing.space8, // 32px
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headline: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    textAlign: 'center',
    marginBottom: Spacing.space2, // 8px
    lineHeight: Typography.headline100 * Typography.lineHeightHeadline,
  },
  body: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral400,
    textAlign: 'center',
    lineHeight: Typography.body200 * Typography.lineHeightBody,
  },
  buttonContainer: {
    marginTop: Spacing.space8, // 32px
  },
});