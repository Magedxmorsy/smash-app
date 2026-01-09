import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Typography } from '../../constants/Typography';

const SIZES = {
  small: { dimension: Spacing.avatarSmall, fontSize: Typography.body200 },
  medium: { dimension: Spacing.avatarMedium, fontSize: Typography.headline200 },
  large: { dimension: Spacing.avatarLarge, fontSize: Typography.headline300 },
};

const Avatar = ({ size = 'medium', source, name = '', withBorder = false, backgroundColor }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    // Return first character of first name + first character of last name
    return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const { dimension, fontSize } = SIZES[size] || SIZES.medium;
  const initials = getInitials(name);
  const bgColor = backgroundColor || Colors.neutral200;

  if (source) {
    return (
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
        style={[
          styles.image,
          {
            width: dimension,
            height: dimension,
          },
          withBorder && styles.imageBorder
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          backgroundColor: bgColor,
        },
        withBorder && styles.containerBorder
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerBorder: {
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  image: {
    borderRadius: BorderRadius.radiusFull,
  },
  imageBorder: {
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  initials: {
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.primary300,
    textAlign: 'center',
  },
});

export default Avatar;
