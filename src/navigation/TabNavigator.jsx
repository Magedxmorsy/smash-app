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

  // Hide tab bar on detail screens and settings
  if (routeName === 'TournamentDetails' || routeName === 'MatchDetails' || routeName === 'Settings' || routeName === 'AccountSettings' || routeName === 'NotificationsSettings' || routeName === 'TermsOfService' || routeName === 'PrivacyPolicy' || routeName === 'AboutSmash') {
    return 'none';
  }

  return 'flex';
}

export default function TabNavigator({ onCreateTournament, onCreateAccount }) {
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
        options={({ route }) => ({
          tabBarStyle: { display: getTabBarVisibility(route) }
        })}
      >
        {(props) => <HomeStack {...props} onCreateTournament={onCreateTournament} />}
      </Tab.Screen>
      <Tab.Screen
        name="CompeteTab"
        options={({ route }) => ({
          tabBarStyle: { display: getTabBarVisibility(route) }
        })}
      >
        {(props) => <CompeteStack {...props} onCreateTournament={onCreateTournament} />}
      </Tab.Screen>
      <Tab.Screen name="UpdatesTab" component={UpdatesScreen} />
      <Tab.Screen
        name="ProfileTab"
        options={({ route }) => ({
          tabBarStyle: { display: getTabBarVisibility(route) }
        })}
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
