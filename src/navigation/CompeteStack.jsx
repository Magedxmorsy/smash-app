import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompeteScreen from '../screens/compete/CompeteScreen';
import TournamentDetailsScreen from '../screens/tournament/TournamentDetailsScreen';
import MatchDetailsScreen from '../screens/match/MatchDetailsScreen';
import TournamentFormNavigator from './TournamentFormNavigator';
import { TournamentFormProvider } from '../contexts/TournamentFormContext';
import { Colors } from '../constants/Colors';

const Stack = createNativeStackNavigator();

export default function CompeteStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Regular screens */}
      <Stack.Screen name="CompeteList" component={CompeteScreen} />
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

      {/* Modal screens group */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="CreateTournamentModal"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        >
          {(props) => (
            <SafeAreaView style={styles.modalContainer} edges={['top']}>
              <TournamentFormProvider initialData={props.route.params?.tournament}>
                <TournamentFormNavigator
                  editMode={props.route.params?.editMode || false}
                  onSave={props.route.params?.onSave}
                  onClose={() => props.navigation.goBack()}
                  tournament={props.route.params?.tournament}
                />
              </TournamentFormProvider>
            </SafeAreaView>
          )}
        </Stack.Screen>
      </Stack.Group>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
