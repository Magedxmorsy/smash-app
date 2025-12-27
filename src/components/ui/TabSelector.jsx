import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';

export default function TabSelector({ tabs, activeTab, onTabChange }) {
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
});
