import React, { createContext, useState, useEffect, useContext } from 'react';
import { signUp, signIn, logOut, getCurrentUser, onAuthChange, getUserData, updateUserProfile, deleteAccount } from '../services/authService';

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
          // NOTE: Removed the "incomplete signup" check that was logging users out
          // If a user can successfully login with Firebase Auth, their account is valid
          // We no longer need to check passwordSet or profileComplete flags
          // Users who haven't verified their email can still login, but will be prompted
          // to verify their email when trying to perform certain actions (like creating tournaments)

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

  const handleDeleteAccount = async (currentPassword) => {
    const result = await deleteAccount(currentPassword);
    if (result.success) {
      // Clear local state after successful deletion
      setUser(null);
      setUserData(null);
    }
    return result;
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
    deleteAccount: handleDeleteAccount,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,
    setIsSigningUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
