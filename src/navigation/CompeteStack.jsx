import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompeteScreen from '../screens/compete/CompeteScreen';
import TournamentDetailsScreen from '../screens/tournament/TournamentDetailsScreen';
import MatchDetailsScreen from '../screens/match/MatchDetailsScreen';
import CreateTournamentModal from '../components/tournament/CreateTournamentModal';
import { Colors } from '../constants/Colors';

const Stack = createNativeStackNavigator();

// Wrapper to bridge navigation with Modal component
function CreateTournamentModalWrapper({ navigation, route }) {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    // Small delay to let modal close animation finish
    setTimeout(() => navigation.goBack(), 100);
  };

  const handleTournamentCreated = (tournament) => {
    if (route.params?.onSave) {
      route.params.onSave(tournament);
    }
    handleClose();
  };

  return (
    <CreateTournamentModal
      visible={visible}
      onClose={handleClose}
      onTournamentCreated={handleTournamentCreated}
      editMode={route.params?.editMode || false}
      tournament={route.params?.tournament}
    />
  );
}

export default function CompeteStack({ onCreateTournament, onEmailVerificationRequired }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Regular screens */}
      <Stack.Screen name="CompeteList">
        {(props) => <CompeteScreen {...props} onCreateTournament={onCreateTournament} />}
      </Stack.Screen>
      <Stack.Screen
        name="TournamentDetails"
        options={{
          animation: 'slide_from_right',
        }}
      >
        {(props) => <TournamentDetailsScreen {...props} onEmailVerificationRequired={onEmailVerificationRequired} />}
      </Stack.Screen>
      <Stack.Screen
        name="MatchDetails"
        component={MatchDetailsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      {/* Modal screens group - using Modal component for consistency */}
      <Stack.Group screenOptions={{
        presentation: 'transparentModal',
        animation: 'none',
        gestureEnabled: false,
      }}>
        <Stack.Screen
          name="CreateTournamentModal"
          component={CreateTournamentModalWrapper}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});
