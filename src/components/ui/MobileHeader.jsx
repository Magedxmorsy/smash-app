import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export default function MobileHeader({ title, showLogo = false, rightIcon, onRightPress }) {
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
  
  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      <View style={styles.content}>
        {/* Left: Logo or Title */}
        {showLogo ? (
          <Text style={styles.logo}>smash</Text>
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
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 68,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space4,
    paddingBottom: Spacing.space4,
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
  },
  rightButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 32,
    color: Colors.primary300,
    lineHeight: 32,
  },
});