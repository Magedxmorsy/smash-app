import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import HomeStack from './HomeStack';
import CompeteStack from './CompeteStack';
import UpdatesScreen from '../screens/updates/UpdatesScreen';
import ProfileStack from './ProfileStack';
import BottomTabBar from '../components/ui/BottomTabBar';
import { Colors } from '../constants/Colors';

const Tab = createBottomTabNavigator();

function getTabBarVisibility(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? route.name;

  console.log('Current route name:', routeName);

  // Hide tab bar on detail screens, settings, and modals
  const hiddenRoutes = [
    'TournamentDetails',
    'MatchDetails',
    'Settings',
    'AccountSettings',
    'ChangePassword',
    'NotificationsSettings',
    'TermsOfService',
    'PrivacyPolicy',
    'AboutSmash',
    'Feedback',
    'CreateTournamentModal'
  ];

  if (hiddenRoutes.includes(routeName)) {
    return 'none';
  }

  return 'flex';
}

export default function TabNavigator({ onCreateAccount }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Tab.Navigator
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: { display: getTabBarVisibility(route) }
        })}
      />
      <Tab.Screen
        name="CompeteTab"
        component={CompeteStack}
        options={({ route }) => ({
          tabBarStyle: { display: getTabBarVisibility(route) }
        })}
      />
      <Tab.Screen name="UpdatesTab" component={UpdatesScreen} />
      <Tab.Screen
        name="ProfileTab"
        options={({ route }) => {
          const display = getTabBarVisibility(route);
          return {
            tabBarStyle: { display }
          };
        }}
      >
        {(props) => <ProfileStack {...props} onCreateAccount={onCreateAccount} />}
      </Tab.Screen>
    </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'visible',
  },
});