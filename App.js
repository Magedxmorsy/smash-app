import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, Modal, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useState, useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import EmailVerificationScreen from './src/screens/auth/EmailVerificationScreen';
import CreatePasswordScreen from './src/screens/auth/CreatePasswordScreen';
import ProfileSetupScreen from './src/screens/auth/ProfileSetupScreen';
import CreateAccountScreen from './src/screens/auth/CreateAccountScreen';
import EmailVerificationPendingScreen from './src/screens/auth/EmailVerificationPendingScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { verifyEmailCode, resendVerificationCode, createUserWithVerificationCode, setUserPassword, createAccountWithEmailVerification } from './src/services/authService';
import { Colors } from './src/constants/Colors';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { TournamentProvider } from './src/contexts/TournamentContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ToastProvider, useToast } from './src/contexts/ToastContext';

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

// Deep linking configuration
const linking = {
  prefixes: [Linking.createURL('/'), 'smash://', 'https://getsmash.net', 'https://www.getsmash.net'],
  config: {
    screens: {
      // Global direct paths
      TournamentDetails: 'tournament/:tournamentId',
      MatchDetails: 'match/:matchId',

      // Tab base paths
      HomeTab: 'home',
      CompeteTab: 'compete',
      UpdatesTab: 'updates',
      ProfileTab: 'profile',
    },
  },
};

function MainApp() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [authScreen, setAuthScreen] = useState('login'); // 'login', 'signup', 'verification', 'createPassword', 'profileSetup', or 'createAccount'
  const [pendingVerification, setPendingVerification] = useState(null);
  const [pendingNewUser, setPendingNewUser] = useState(null); // Store email for new Firebase flow
  const [pendingAction, setPendingAction] = useState(null); // Store action to perform after auth
  const { isAuthenticated, loading, refreshUserData, setIsSigningUp, isEmailVerified, userData, setLocalUserData } = useAuth();
  const { showToast } = useToast();
  const wasAuthenticatedRef = useRef(false);
  const emailVerificationModalDismissedRef = useRef(false); // Track if user manually dismissed the modal

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
        setPendingNewUser(null);
        // Don't clear pendingAction here - we need it after successful auth
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showLoginModal]);

  // Execute pending action after successful authentication
  useEffect(() => {
    if (isAuthenticated && pendingAction && !showLoginModal && !showEmailVerificationModal) {
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
  }, [isAuthenticated, pendingAction, showLoginModal, showEmailVerificationModal]);

  // Show email verification modal if user is authenticated but email not verified
  useEffect(() => {
    if (isAuthenticated && !isEmailVerified && !loading && !showLoginModal && userData && !emailVerificationModalDismissedRef.current) {
      // Small delay to ensure login modal is fully closed
      const timer = setTimeout(() => {
        setShowEmailVerificationModal(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isEmailVerified, loading, showLoginModal, userData]);

  const checkOnboarding = async () => {
    try {
      // TEMPORARY: Always show onboarding for development
      // await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);

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

      // Reset signup flag - signup is now complete
      setIsSigningUp(false);

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
    setPendingNewUser(null);
    // Reset signup flag when modal closes
    setIsSigningUp(false);
  };

  const handleCreateAccount = () => {
    setPendingAction({ type: 'createAccount', callback: null });
    setShowLoginModal(true);
  };

  const handleForgotPassword = () => {
    setAuthScreen('forgotPassword');
  };

  const handleCreateTournament = (callback) => {
    if (!isAuthenticated) {
      // User is not authenticated, show login modal and store the callback
      setPendingAction({ type: 'createTournament', callback });
      setShowLoginModal(true);
    } else if (!isEmailVerified) {
      // User is authenticated but email not verified - show verification modal
      setPendingAction({ type: 'createTournament', callback });
      // Reset dismissed flag when user actively tries to create tournament
      emailVerificationModalDismissedRef.current = false;
      setShowEmailVerificationModal(true);
    } else {
      // User is authenticated and verified, execute callback directly
      if (callback) {
        callback();
      }
    }
  };

  const handleEmailSubmit = async (email, isNewUser) => {
    if (isNewUser) {
      // Set flag to prevent auto-logout during signup
      setIsSigningUp(true);

      // Store email and navigate to create account (password) screen
      setPendingNewUser({ email });
      setAuthScreen('createAccount');
    } else {
      // Show password field for existing users (handled within LoginScreen)
      // The LoginScreen will handle this internally
    }
  };

  const handleAccountCreated = async (email, password) => {
    // Create account with Firebase email verification
    const { success, error } = await createAccountWithEmailVerification(email, password);

    if (success) {
      // Show success toast
      showToast(`Verification email sent to ${email}`);

      // Navigate to profile setup
      setPendingNewUser({ email });
      setAuthScreen('profileSetup');
    } else {
      Alert.alert('Error', error || 'Failed to create account');
      // Reset flag if failed
      setIsSigningUp(false);
    }
  };

  const handleNewUserProfileComplete = async (profileData) => {
    console.log('🎯 [handleNewUserProfileComplete] Starting with:', profileData);
    if (!pendingNewUser) {
      console.log('❌ [handleNewUserProfileComplete] No pending new user');
      return;
    }

    // Save profile data to Firebase
    const { completeUserProfile } = await import('./src/services/authService');
    const { success, error } = await completeUserProfile(null, profileData); // Pass null for uid since user is already authenticated

    console.log('🎯 [handleNewUserProfileComplete] completeUserProfile result:', { success, error });

    if (success) {
      console.log('🎯 [handleNewUserProfileComplete] Optimistically updating user data...');
      setLocalUserData({
        ...userData,
        ...profileData,
        profileComplete: true,
        updatedAt: new Date().toISOString()
      });

      console.log('🎯 [handleNewUserProfileComplete] Refreshing user data (Skipped for performance/consistency)...');
      // refreshUserData(); // SKIPPED: Rely on setLocalUserData to avoid stale reads
      console.log('🎯 [handleNewUserProfileComplete] User data refreshed');

      console.log('🎯 [handleNewUserProfileComplete] Resetting signup flag...');
      // Reset signup flag - signup is now complete
      setIsSigningUp(false);

      console.log('🎯 [handleNewUserProfileComplete] Closing auth modal...');
      // Close auth modal
      setPendingNewUser(null);
      setAuthScreen('login');
      setShowLoginModal(false);

      console.log('🎯 [handleNewUserProfileComplete] Showing email verification modal...');
      // Show email verification modal
      setShowEmailVerificationModal(true);
      console.log('✅ [handleNewUserProfileComplete] Complete!');
    } else {
      console.error('❌ [handleNewUserProfileComplete] Error:', error);
      Alert.alert('Error', error || 'Failed to complete profile');
    }
  };

  const handleEmailVerified = async () => {
    // Refresh user data to update email verification status
    await refreshUserData();

    // Close email verification modal
    setShowEmailVerificationModal(false);

    // Reset the dismissed flag since email is now verified
    emailVerificationModalDismissedRef.current = false;

    // Execute pending action if any
    if (pendingAction && pendingAction.callback) {
      pendingAction.callback();
      setPendingAction(null);
    }
  };

  const handleCloseEmailVerificationModal = () => {
    setShowEmailVerificationModal(false);
    // Clear pending action when modal is closed without verification
    setPendingAction(null);
    // Mark that user manually dismissed the modal
    emailVerificationModalDismissedRef.current = true;
  };

  const renderAuthScreen = () => {
    switch (authScreen) {
      case 'login':
        return (
          <LoginScreen
            onNavigateToSignUp={() => setAuthScreen('signup')}
            onClose={handleModalClose}
            onEmailSubmit={handleEmailSubmit}
            onForgotPassword={handleForgotPassword}
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
      case 'forgotPassword':
        return (
          <ForgotPasswordScreen
            onBack={() => setAuthScreen('login')}
            onClose={handleModalClose}
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
        // Check if this is the new Firebase flow or old verification flow
        if (pendingNewUser) {
          return (
            <ProfileSetupScreen
              onProfileComplete={handleNewUserProfileComplete}
              onBack={() => setAuthScreen('createAccount')}
            />
          );
        } else {
          return (
            <ProfileSetupScreen
              onProfileComplete={handleProfileComplete}
              onBack={() => setAuthScreen('createPassword')}
            />
          );
        }
      case 'createAccount':
        return (
          <CreateAccountScreen
            email={pendingNewUser?.email || ''}
            onBack={() => setAuthScreen('signup')}
            onClose={handleModalClose}
            onAccountCreated={handleAccountCreated}
          />
        );
      default:
        return (
          <LoginScreen
            onNavigateToSignUp={() => setAuthScreen('signup')}
            onClose={handleModalClose}
            onForgotPassword={handleForgotPassword}
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
          onEmailVerificationRequired={() => {
            // Reset dismissed flag when user actively tries to join/create team
            emailVerificationModalDismissedRef.current = false;
            setShowEmailVerificationModal(true);
          }}
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

      {/* Email Verification Modal */}
      <Modal
        visible={showEmailVerificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseEmailVerificationModal}
      >
        <EmailVerificationPendingScreen
          email={userData?.email || ''}
          onVerified={handleEmailVerified}
          onClose={handleCloseEmailVerificationModal}
        />
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
