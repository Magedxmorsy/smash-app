import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

/**
 * Avatar component with support for images and initials fallback
 *
 * @param {string} size - 'small' (40px), 'medium' (72px), or 'large' (96px)
 * @param {string} source - Image URI for avatar
 * @param {string} name - Name to generate initials from (fallback)
 * @param {boolean} withBorder - Show border around avatar
 * @param {string} backgroundColor - Custom background color for initials (defaults to Primary-300)
 */
const Avatar = ({
  size = 'medium',
  source,
  name = '',
  withBorder = false,
  backgroundColor
}) => {
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Size configurations
  const sizeConfig = {
    small: {
      dimension: 40,
      fontSize: 16,
    },
    medium: {
      dimension: 72,
      fontSize: 28,
    },
    large: {
      dimension: 96,
      fontSize: 40,
    },
  };

  const config = sizeConfig[size] || sizeConfig.medium;
  const initials = getInitials(name);
  const bgColor = backgroundColor || colors.primary300;

  return (
    <View
      style={[
        styles.container,
        {
          width: config.dimension,
          height: config.dimension,
          backgroundColor: source ? 'transparent' : bgColor,
          borderWidth: withBorder ? 1 : 0,
        },
      ]}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: config.dimension,
              height: config.dimension,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize: config.fontSize,
            },
          ]}
        >
          {initials}
        </Text>
      )}
    </View>
  );
};

const colors = {
  primary300: '#281F42',
  surface: '#FFFFFF',
  border: '#E8E8E8',
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    borderRadius: 9999,
  },
  initials: {
    fontFamily: 'GeneralSans-Semibold',
    color: colors.surface,
    textAlign: 'center',
  },
});

export default Avatar;
