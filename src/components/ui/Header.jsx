import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

// Icons
import SmashLogo from '../../../assets/branding/smash-logo.svg';
import AddIcon from '../../../assets/icons/add.svg';
import ChevronLeft from '../../../assets/icons/chevronleft.svg';
import ShareIcon from '../../../assets/icons/share.svg';
import MoreIcon from '../../../assets/icons/More.svg';

/**
 * Unified Header Component
 *
 * Variants:
 * - "page": For main tab screens (Home, Compete, Updates, Profile)
 * - "inner": For detail screens (Tournament Details, Match Details, Settings, etc.)
 *
 * Features:
 * - Blur effect that extends under status bar
 * - Automatic safe area handling
 * - Absolute positioning for scroll-under effect
 */
export default function Header({
  variant = 'page',
  title,
  showLogo = false,
  rightIcon,
  onRightPress,
  RightIconComponent,
  onBack,
}) {
  const insets = useSafeAreaInsets();

  const renderLeftContent = () => {
    if (variant === 'inner') {
      // Inner pages: back button
      return (
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft width={32} height={32} color={Colors.primary300} />
        </TouchableOpacity>
      );
    }

    // Page variant: logo or empty space
    if (showLogo) {
      return <SmashLogo width={100} height={36} />;
    }

    return <View style={styles.iconButton} />;
  };

  const renderCenterContent = () => {
    if (variant === 'inner' || (variant === 'page' && title)) {
      return <Text style={styles.title}>{title}</Text>;
    }
    return null;
  };

  const renderRightContent = () => {
    if (!rightIcon) {
      return <View style={styles.iconButton} />;
    }

    let IconComponent = AddIcon;
    if (RightIconComponent) {
      IconComponent = RightIconComponent;
    } else if (rightIcon === 'share') {
      IconComponent = ShareIcon;
    } else if (rightIcon === 'more') {
      IconComponent = MoreIcon;
    }

    return (
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onRightPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <IconComponent width={32} height={32} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* Blur background - extends to edges */}
      <BlurView
        intensity={80}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />

      {/* Safe area spacer for status bar */}
      <View style={{ height: insets.top }} />

      {/* Header content */}
      <View style={styles.content}>
        {renderLeftContent()}
        {renderCenterContent()}
        {renderRightContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    overflow: 'hidden',
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space4,
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline200,
    color: Colors.primary300,
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
