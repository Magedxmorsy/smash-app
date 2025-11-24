import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

import HomeIcon from '../../../assets/icons/home.svg';
import HomeSelectedIcon from '../../../assets/icons/home-selected.svg';
import CompeteIcon from '../../../assets/icons/compete.svg';
import CompeteSelectedIcon from '../../../assets/icons/compete-selected.svg';
import UpdatesIcon from '../../../assets/icons/updates.svg';
import UpdatesSelectedIcon from '../../../assets/icons/updates-selected.svg';
import ProfileIcon from '../../../assets/icons/user.svg';
import ProfileSelectedIcon from '../../../assets/icons/user-selected.svg';
import * as Haptics from 'expo-haptics';

export default function BottomTabBar({ activeTab, onTabPress }) {
  const tabs = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: HomeIcon,
      iconSelected: HomeSelectedIcon
    },
    { 
      id: 'compete', 
      label: 'Compete', 
      icon: CompeteIcon,
      iconSelected: CompeteSelectedIcon
    },
    { 
      id: 'updates', 
      label: 'Updates', 
      icon: UpdatesIcon,
      iconSelected: UpdatesSelectedIcon
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: ProfileIcon,
      iconSelected: ProfileSelectedIcon
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = isActive ? tab.iconSelected : tab.icon;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabPress(tab.id);
            }}
            activeOpacity={0.7}
          >
            <Icon width={32} height={32} />
            <Text style={styles.label}>
  {tab.label}
</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.space1,
    paddingHorizontal: Spacing.space4,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tab: {
    flex: 1,
    height: 52,
    minWidth: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body300,
    color: Colors.primary300,  // Changed from neutral400
    marginTop: 0,
  },
});