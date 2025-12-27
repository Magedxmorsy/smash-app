import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompeteScreen from '../screens/compete/CompeteScreen';
import TournamentDetailsScreen from '../screens/tournament/TournamentDetailsScreen';
import MatchDetailsScreen from '../screens/match/MatchDetailsScreen';

const Stack = createNativeStackNavigator();

export default function CompeteStack({ onCreateTournament }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CompeteList">
        {(props) => <CompeteScreen {...props} onCreateTournament={onCreateTournament} />}
      </Stack.Screen>
      <Stack.Screen
        name="TournamentDetails"
        component={TournamentDetailsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
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
