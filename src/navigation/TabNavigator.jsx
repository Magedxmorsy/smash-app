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

export default function TabNavigator({ onCreateAccount, onCreateTournament, onEmailVerificationRequired }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Tab.Navigator
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
      <Tab.Screen name="HomeTab">
        {(props) => <HomeStack {...props} onCreateTournament={onCreateTournament} onEmailVerificationRequired={onEmailVerificationRequired} />}
      </Tab.Screen>
      <Tab.Screen name="CompeteTab">
        {(props) => <CompeteStack {...props} onCreateTournament={onCreateTournament} onEmailVerificationRequired={onEmailVerificationRequired} />}
      </Tab.Screen>
      <Tab.Screen name="UpdatesTab" component={UpdatesScreen} />
      <Tab.Screen name="ProfileTab">
        {(props) => <ProfileStack {...props} onCreateAccount={onCreateAccount} onEmailVerificationRequired={onEmailVerificationRequired} />}
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