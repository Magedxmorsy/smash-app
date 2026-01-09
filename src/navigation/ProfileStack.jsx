import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import AccountSettingsScreen from '../screens/profile/AccountSettingsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import NotificationsSettingsScreen from '../screens/profile/NotificationsSettingsScreen';
import TermsOfServiceScreen from '../screens/profile/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import AboutSmashScreen from '../screens/profile/AboutSmashScreen';
import FeedbackScreen from '../screens/profile/FeedbackScreen';
import TournamentDetailsScreen from '../screens/tournament/TournamentDetailsScreen';
import MatchDetailsScreen from '../screens/match/MatchDetailsScreen';
import TournamentFormNavigator from './TournamentFormNavigator';
import { TournamentFormProvider } from '../contexts/TournamentFormContext';
import { Colors } from '../constants/Colors';

const Stack = createNativeStackNavigator();

export default function ProfileStack({ onCreateAccount }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProfileList">
        {(props) => <ProfileScreen {...props} onCreateAccount={onCreateAccount} />}
      </Stack.Screen>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="NotificationsSettings"
        component={NotificationsSettingsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="AboutSmash"
        component={AboutSmashScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
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
      <Stack.Group screenOptions={{
        presentation: 'modal',
        gestureEnabled: true,
        fullScreenGestureEnabled: false,
      }}>
        <Stack.Screen
          name="CreateTournamentModal"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            fullScreenGestureEnabled: false,
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
