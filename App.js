import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useState, useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import EmailVerificationScreen from './src/screens/auth/EmailVerificationScreen';
import CreatePasswordScreen from './src/screens/auth/CreatePasswordScreen';
import ProfileSetupScreen from './src/screens/auth/ProfileSetupScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { verifyEmailCode, resendVerificationCode, createUserWithVerificationCode, setUserPassword } from './src/services/authService';
import { Alert } from 'react-native';
import { Colors } from './src/constants/Colors';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { TournamentProvider } from './src/contexts/TournamentContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ToastProvider } from './src/contexts/ToastContext';

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

// Deep linking configuration
const linking = {
  prefixes: ['smash://', 'https://smash.app'],
  config: {
    screens: {
      HomeTab: {
        screens: {
          HomeList: 'home',
          MatchDetails: 'match/:matchId',
        },
      },
      CompeteTab: {
        screens: {
          CompeteList: 'compete',
          TournamentDetails: 'tournament/:tournamentId',
        },
      },
      UpdatesTab: 'updates',
      ProfileTab: {
        screens: {
          ProfileList: 'profile',
          TournamentDetails: 'tournament/:tournamentId',
        },
      },
    },
  },
};

function MainApp() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authScreen, setAuthScreen] = useState('login'); // 'login', 'signup', 'verification', 'createPassword', or 'profileSetup'
  const [pendingVerification, setPendingVerification] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // Store action to perform after auth
  const { isAuthenticated, loading, refreshUserData } = useAuth();
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  // Reset auth flow when modal is closed
  useEffect(() => {
    if (!showLoginModal) {
      // Small delay to allow modal animation to complete
      const timer = setTimeout(() => {
        setAuthScreen('login');
        setPendingVerification(null);
        // Don't clear pendingAction here - we need it after successful auth
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showLoginModal]);

  // Execute pending action after successful authentication
  useEffect(() => {
    if (isAuthenticated && pendingAction && !showLoginModal) {
      // Small delay to ensure modal is fully closed
      const timer = setTimeout(() => {
        console.log('Executing pending action:', pendingAction);
        if (pendingAction.callback) {
          pendingAction.callback();
        }
        setPendingAction(null); // Clear after execution
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, pendingAction, showLoginModal]);

  const checkOnboarding = async () => {
    try {
      // TEMPORARY: Always show onboarding for development
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);

      const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  // Watch for logout and show onboarding
  useEffect(() => {
    if (!loading) {
      // Check if user just logged out (was authenticated, now is not)
      if (wasAuthenticatedRef.current && !isAuthenticated) {
        // User logged out, show onboarding screen
        const showOnboardingAfterLogout = async () => {
          try {
            await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
            setShowOnboarding(true);
          } catch (error) {
            console.error('Error clearing onboarding state:', error);
          }
        };
        showOnboardingAfterLogout();
      }
      // Update the ref to track current authentication state
      wasAuthenticatedRef.current = isAuthenticated;
    }
  }, [isAuthenticated, loading]);

  const handleVerifySuccess = async (code) => {
    if (!pendingVerification) return false;

    const { success, error } = await verifyEmailCode(pendingVerification.uid, code);

    if (success) {
      // Don't show alert, just move to password creation with haptic feedback
      setAuthScreen('createPassword');
      return true;
    } else {
      Alert.alert('Error', error || 'Invalid verification code');
      return false;
    }
  };

  const handleResendCode = async () => {
    if (!pendingVerification) return;

    const { success, error } = await resendVerificationCode(pendingVerification.uid);

    if (success) {
      Alert.alert('Success', 'A new verification code has been sent');
    } else {
      Alert.alert('Error', error || 'Failed to resend code');
    }
  };

  const handleSignUpComplete = (email, uid) => {
    setPendingVerification({ email, uid });
    setAuthScreen('verification');
  };

  const handlePasswordCreated = async (password) => {
    if (!pendingVerification) return;

    // Update the user's password in the auth service
    const { success, error } = await setUserPassword(pendingVerification.uid, password);

    if (success) {
      // Move to profile setup instead of showing success alert
      setAuthScreen('profileSetup');
    } else {
      Alert.alert('Error', error || 'Failed to set password');
    }
  };

  const handleProfileComplete = async (profileData) => {
    if (!pendingVerification) return;

    // Save profile data to Firebase
    const { completeUserProfile } = await import('./src/services/authService');
    const { success, error } = await completeUserProfile(pendingVerification.uid, profileData);

    if (success) {
      // Refresh user data to get the updated profile information
      await refreshUserData();

      // Close modal and let pending action execute
      setPendingVerification(null);
      setAuthScreen('login');
      setShowLoginModal(false);
      // pendingAction will execute via useEffect when isAuthenticated becomes true
    } else {
      Alert.alert('Error', error || 'Failed to complete profile');
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setAuthScreen('login');
  };

  const handleModalClose = () => {
    setShowLoginModal(false);
    // Reset to login screen and clear any pending data
    setAuthScreen('login');
    setPendingVerification(null);
  };

  const handleCreateAccount = () => {
    setPendingAction({ type: 'createAccount', callback: null });
    setShowLoginModal(true);
  };

  const handleCreateTournament = (callback) => {
    if (!isAuthenticated) {
      // User is not authenticated, show login modal and store the callback
      setPendingAction({ type: 'createTournament', callback });
      setShowLoginModal(true);
    } else {
      // User is authenticated, execute callback directly
      if (callback) {
        callback();
      }
    }
  };

  const handleEmailSubmit = async (email, isNewUser) => {
    if (isNewUser) {
      // Create user account and send verification code
      const { success, uid, error } = await createUserWithVerificationCode(email);

      if (success) {
        // Navigate to verification screen for new users
        setPendingVerification({ email, uid });
        setAuthScreen('verification');
      } else {
        Alert.alert('Error', error || 'Failed to create account');
      }
    } else {
      // Show password field for existing users (handled within LoginScreen)
      // The LoginScreen will handle this internally
    }
  };

  const renderAuthScreen = () => {
    switch (authScreen) {
      case 'login':
        return (
          <LoginScreen
            onNavigateToSignUp={() => setAuthScreen('signup')}
            onClose={handleModalClose}
            onEmailSubmit={handleEmailSubmit}
          />
        );
      case 'signup':
        return (
          <SignUpScreen
            onNavigateToLogin={() => setAuthScreen('login')}
            onClose={handleModalClose}
            onEmailSubmit={handleEmailSubmit}
          />
        );
      case 'verification':
        return (
          <EmailVerificationScreen
            email={pendingVerification?.email || ''}
            onVerifySuccess={handleVerifySuccess}
            onResendCode={handleResendCode}
            onBack={() => setAuthScreen('login')}
          />
        );
      case 'createPassword':
        return (
          <CreatePasswordScreen
            onPasswordCreated={handlePasswordCreated}
            onBack={() => setAuthScreen('verification')}
          />
        );
      case 'profileSetup':
        return (
          <ProfileSetupScreen
            onProfileComplete={handleProfileComplete}
            onBack={() => setAuthScreen('createPassword')}
          />
        );
      default:
        return (
          <LoginScreen
            onNavigateToSignUp={() => setAuthScreen('signup')}
            onClose={handleModalClose}
          />
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent300} />
      </View>
    );
  }

  // Show onboarding screen
  if (showOnboarding) {
    return <WelcomeScreen onGetStarted={handleOnboardingComplete} />;
  }

  return (
    <>
      <NavigationContainer linking={linking}>
        <TabNavigator
          onCreateAccount={handleCreateAccount}
          onCreateTournament={handleCreateTournament}
        />
        <StatusBar style="dark" />
      </NavigationContainer>

      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        {renderAuthScreen()}
      </Modal>
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'GeneralSans-Regular': require('./assets/fonts/GeneralSans-Regular.otf'),
    'GeneralSans-Medium': require('./assets/fonts/GeneralSans-Medium.otf'),
    'GeneralSans-Semibold': require('./assets/fonts/GeneralSans-Semibold.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <TournamentProvider>
            <ToastProvider>
              <MainApp />
            </ToastProvider>
          </TournamentProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
