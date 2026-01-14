import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import MatchDetailsScreen from '../screens/match/MatchDetailsScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack({ onCreateTournament, onEmailVerificationRequired }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HomeList">
        {(props) => <HomeScreen {...props} onCreateTournament={onCreateTournament} />}
      </Stack.Screen>
      <Stack.Screen
        name="MatchDetails"
        component={MatchDetailsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
