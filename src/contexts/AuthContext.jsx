import React, { createContext, useState, useEffect, useContext } from 'react';
import { signUp, signIn, logOut, getCurrentUser, onAuthChange, getUserData, updateUserProfile } from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        // Fetch user data from Firestore
        const { success, data } = await getUserData(authUser.uid);
        if (success) {
          // Check if this is an incomplete signup (no password set and not verified)
          // BUT only log out if we're NOT actively in the signup process
          if (data && !data.passwordSet && !data.emailVerified && !isSigningUp) {
            console.warn('⚠️ Incomplete signup detected for user:', authUser.email);
            console.warn('⚠️ User data:', {
              email: data.email,
              passwordSet: data.passwordSet,
              emailVerified: data.emailVerified,
              displayName: data.displayName
            });

            // Log out the incomplete account to force re-authentication
            // This prevents the app from showing an incomplete profile
            console.log('🔄 Logging out incomplete account...');
            await logOut();
            setUser(null);
            setUserData(null);
            setLoading(false);
            return;
          }

          setUserData(data);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isSigningUp]);

  const handleSignUp = async (email, password, displayName) => {
    const result = await signUp(email, password, displayName);
    if (result.success && result.user) {
      const { success, data } = await getUserData(result.user.uid);
      if (success) {
        setUserData(data);
      }
    }
    return result;
  };

  const handleSignIn = async (email, password) => {
    const result = await signIn(email, password);
    if (result.success && result.user) {
      const { success, data } = await getUserData(result.user.uid);
      if (success) {
        setUserData(data);
      }
    }
    return result;
  };

  const handleLogOut = async () => {
    const result = await logOut();
    if (!result.error) {
      setUser(null);
      setUserData(null);
    }
    return result;
  };

  const refreshUserData = async () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const { success, data } = await getUserData(currentUser.uid);
      if (success) {
        setUserData(data);
      }
    }
  };

  const updateUserData = async (profileData) => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const result = await updateUserProfile(currentUser.uid, profileData);
      if (result.success) {
        // Refresh user data from Firestore to get the updated values
        await refreshUserData();
      }
      return result;
    }
    return { success: false, error: 'No user logged in' };
  };

  // Use dummy user data when not authenticated for testing purposes
  const effectiveUserData = userData || {
    uid: 'dummy-user-id',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    avatarUri: null,
  };

  const value = {
    user,
    userData: effectiveUserData,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    logOut: handleLogOut,
    refreshUserData,
    updateUserData,
    isAuthenticated: !!user,
    setIsSigningUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
