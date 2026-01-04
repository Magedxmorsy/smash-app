import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';

export default function TabSelector({ tabs, activeTab, onTabChange, variant = 'segmented' }) {
  if (variant === 'underline') {
    return (
      <View style={styles.underlineContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.underlineTab}
            onPress={() => onTabChange(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.underlineTabText,
                activeTab === tab && styles.underlineTabTextActive,
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && styles.tabActive,
          ]}
          onPress={() => onTabChange(tab)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.radius3,
    padding: 4,
    gap: 4,
    height: 48,
  },
  tab: {
    flex: 1,
    borderRadius: BorderRadius.radius2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  tabActive: {
    backgroundColor: Colors.surface,
  },
  tabText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.button,
    color: Colors.primary300,
  },
  tabTextActive: {
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.primary300,
  },
  // Underline variant styles
  underlineContainer: {
    flexDirection: 'row',
    gap: Spacing.space5, // 20px gap between tabs
    marginBottom: Spacing.space4, // 16px margin bottom
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  underlineTab: {
    paddingBottom: Spacing.space3, // 12px padding bottom
    position: 'relative',
  },
  underlineTabText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.h5, // Larger font for underline tabs
    color: Colors.textTertiary, // Gray for inactive
  },
  underlineTabTextActive: {
    color: Colors.primary300, // Dark purple for active
  },
  underline: {
    position: 'absolute',
    bottom: -1, // Overlap with border
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary300,
    borderRadius: 2,
  },
});
