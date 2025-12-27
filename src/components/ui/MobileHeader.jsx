import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import SmashLogo from '../../../assets/branding/smash-logo.svg';
import AddIcon from '../../../assets/icons/add.svg';

export default function MobileHeader({ title, showLogo = false, rightIcon, onRightPress, RightIconComponent }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left: Logo or Title */}
        {showLogo ? (
          <View style={{ marginBottom: 0 }}>
            <SmashLogo width={100} height={36} />
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}

        {/* Right: Action Icon */}
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {RightIconComponent ? <RightIconComponent width={32} height={32} /> : <AddIcon width={32} height={32} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space4,
  },
  logo: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 36,
    color: Colors.primary300,
    letterSpacing: -1,
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline200,
    color: Colors.primary300,
    height: 30,
    //lineHeight: 30,
  },
  rightButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -8,
    marginBottom: -4,
  },
  plusIcon: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 32,
    color: Colors.primary300,
    lineHeight: 32,
  },
});