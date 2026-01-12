import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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

export default function TabNavigator({ onCreateAccount, onCreateTournament }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Tab.Navigator
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
      <Tab.Screen name="HomeTab">
        {(props) => <HomeStack {...props} onCreateTournament={onCreateTournament} />}
      </Tab.Screen>
      <Tab.Screen name="CompeteTab" component={CompeteStack} />
      <Tab.Screen name="UpdatesTab" component={UpdatesScreen} />
      <Tab.Screen name="ProfileTab">
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