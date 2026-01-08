import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
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
import { useNotifications } from '../../contexts/NotificationContext';

export default function BottomTabBar({ state, descriptors, navigation }) {
  const { unreadCount } = useNotifications();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const tabs = [
    {
      id: 'HomeTab',
      label: 'Home',
      icon: HomeIcon,
      iconSelected: HomeSelectedIcon
    },
    {
      id: 'CompeteTab',
      label: 'Compete',
      icon: CompeteIcon,
      iconSelected: CompeteSelectedIcon
    },
    {
      id: 'UpdatesTab',
      label: 'Updates',
      icon: UpdatesIcon,
      iconSelected: UpdatesSelectedIcon
    },
    {
      id: 'ProfileTab',
      label: 'Profile',
      icon: ProfileIcon,
      iconSelected: ProfileSelectedIcon
    },
  ];

  // Check if we're on a nested screen in any stack
  // Convention: Hide tab bar for any non-root screen (index > 0)
  const currentRoute = state.routes[state.index];
  const nestedState = currentRoute.state;
  const isOnDetailScreen = nestedState && nestedState.index > 0;

  // Animate tab bar in/out based on route
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnDetailScreen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnDetailScreen]);

  // Calculate the total height including safe area
  const totalHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, totalHeight], // Slide down by full height including safe area
  });

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ translateY }]
      }
    ]}>
      <BlurView
        intensity={80}
        tint="light"
        style={[
          StyleSheet.absoluteFillObject,
          {
            bottom: Platform.OS === 'ios' ? -insets.bottom : 0,
          }
        ]}
      />
      <View style={styles.tabsWrapper}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = tabs[index];
          const Icon = isFocused ? tab.iconSelected : tab.icon;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon width={32} height={32} />
                {tab.id === 'UpdatesTab' && unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.label}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    overflow: 'visible',
  },
  tabsWrapper: {
    flexDirection: 'row',
    height: 60,
    paddingTop: Spacing.space1,
    paddingHorizontal: Spacing.space4,
  },
  tab: {
    flex: 1,
    height: 52,
    minWidth: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.accent300,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  badgeText: {
    color: Colors.primary300,
    fontSize: 11,
    fontFamily: 'GeneralSans-Semibold',
  },
  label: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body300,
    color: Colors.primary300,
    marginTop: 0,
  },
});