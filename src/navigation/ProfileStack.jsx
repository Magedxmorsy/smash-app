import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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

export default function ProfileStack({ onCreateAccount, onEmailVerificationRequired }) {
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
