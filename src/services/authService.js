import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { createDefaultNotificationSettings } from './notificationSettingsService';

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || null,
      emailVerified: false,
      verificationCode: verificationCode,
      verificationCodeCreatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create default notification settings for new user
    await createDefaultNotificationSettings(user.uid);

    // In a real app, you would send this code via email using a service like SendGrid
    // For now, we'll just log it (you can implement email sending later)
    console.log(`Verification code for ${email}: ${verificationCode}`);

    return { success: true, user, error: null, verificationCode };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, user: null, error: getErrorMessage(error.code) };
  }
};

/**
 * Create user account with temporary password and send verification code
 * This is used in the new auth flow where users enter email first
 */
export const createUserWithVerificationCode = async (email) => {
  try {
    // Generate temporary password (user won't see this)
    const tempPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);

    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    const user = userCredential.user;

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: null,
      emailVerified: false,
      passwordSet: false,
      verificationCode: verificationCode,
      verificationCodeCreatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create default notification settings for new user
    await createDefaultNotificationSettings(user.uid);

    // In a real app, send this code via email
    console.log(`🔐 Verification code for ${email}: ${verificationCode}`);
    alert(`DEBUG: Your verification code is ${verificationCode}`);

    return { success: true, user, uid: user.uid, verificationCode, error: null };
  } catch (error) {
    console.error('Create user error:', error);

    // If email already exists, check if it's an incomplete signup
    if (error.code === 'auth/email-already-in-use') {
      try {
        // Check Firestore for incomplete signup (no password set)
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();

          // If the account setup was never completed (no password set), allow retry with new code
          if (!userData.passwordSet && !userData.emailVerified) {
            const uid = userData.uid;

            // Generate new verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Update the existing user document with new code
            await updateDoc(doc(db, 'users', uid), {
              verificationCode: verificationCode,
              verificationCodeCreatedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

            console.log(`🔐 New verification code for existing user ${email}: ${verificationCode}`);
            alert(`DEBUG: Your verification code is ${verificationCode}`);

            return { success: true, user: null, uid, verificationCode, error: null };
          }
        }

        // Account exists and is complete, user should log in instead
        return {
          success: false,
          user: null,
          uid: null,
          verificationCode: null,
          error: 'This email is already registered. Please use the login screen to sign in.'
        };
      } catch (firestoreError) {
        console.error('Firestore check error:', firestoreError);
      }
    }

    return { success: false, user: null, uid: null, verificationCode: null, error: getErrorMessage(error.code) };
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, user: null, error: getErrorMessage(error.code) };
  }
};

/**
 * Sign out the current user
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen to authentication state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data(), error: null };
    }
    return { success: false, data: null, error: 'User not found' };
  } catch (error) {
    console.error('Get user data error:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Verify email with code
 */
export const verifyEmailCode = async (uid, code) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();

    // Check if code matches
    if (userData.verificationCode !== code) {
      return { success: false, error: 'Invalid verification code' };
    }

    // Check if code is expired (15 minutes)
    const codeCreatedAt = new Date(userData.verificationCodeCreatedAt);
    const now = new Date();
    const diffMinutes = (now - codeCreatedAt) / 1000 / 60;

    if (diffMinutes > 15) {
      return { success: false, error: 'Verification code has expired' };
    }

    // Update user as verified
    await updateDoc(doc(db, 'users', uid), {
      emailVerified: true,
      verificationCode: null,
      verificationCodeCreatedAt: null,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Verify email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if email exists in the system
 * ALWAYS checks Firestore as the source of truth
 */
export const checkEmailExists = async (email) => {
  try {
    console.log('📧 Checking if email exists:', email);

    // Check Firestore directly (most reliable method)
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    console.log('📊 Firestore query result:', {
      found: !querySnapshot.empty,
      count: querySnapshot.size
    });

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      console.log('👤 User found in Firestore:', {
        email: userData.email,
        hasPassword: !!userData.passwordSet,
        emailVerified: !!userData.emailVerified
      });

      return { exists: true, error: null };
    }

    console.log('❌ No user found in Firestore for email:', email);
    return { exists: false, error: null };
  } catch (error) {
    console.error('❌ Check email error:', error);
    return { exists: false, error: error.message };
  }
};

/**
 * Resend verification code
 */
export const resendVerificationCode = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user document with new code
    await updateDoc(doc(db, 'users', uid), {
      verificationCode: verificationCode,
      verificationCodeCreatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // In a real app, send this code via email
    console.log(`New verification code for ${userData.email}: ${verificationCode}`);

    return { success: true, error: null, verificationCode };
  } catch (error) {
    console.error('Resend verification code error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Set user password after verification
 * This updates the user's temporary password to their chosen password
 */
export const setUserPassword = async (uid, password) => {
  try {
    // Get the current user
    const user = auth.currentUser;

    if (!user || user.uid !== uid) {
      return { success: false, error: 'User not authenticated' };
    }

    // Update the password
    await updatePassword(user, password);

    // Update user document to mark setup as complete
    await updateDoc(doc(db, 'users', uid), {
      passwordSet: true,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Set password error:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
};

/**
 * Complete user profile with avatar and name
 * This saves the user's profile information after password is set
 */
export const completeUserProfile = async (uid, profileData) => {
  try {
    const { firstName, lastName, avatarUri } = profileData;

    // Update user document with profile information
    await updateDoc(doc(db, 'users', uid), {
      firstName: firstName,
      lastName: lastName,
      displayName: `${firstName} ${lastName}`,
      avatarUri: avatarUri || null,
      profileComplete: true,
      updatedAt: new Date().toISOString(),
    });

    // Update Firebase Auth profile
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Complete profile error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user profile information
 * This updates an existing user's profile data
 */
export const updateUserProfile = async (uid, profileData) => {
  try {
    const { firstName, lastName, avatarUri } = profileData;

    // Update user document with profile information
    await updateDoc(doc(db, 'users', uid), {
      firstName: firstName,
      lastName: lastName,
      displayName: `${firstName} ${lastName}`,
      avatarUri: avatarUri !== undefined ? avatarUri : null,
      updatedAt: new Date().toISOString(),
    });

    // Update Firebase Auth profile
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Convert Firebase error codes to user-friendly messages
 */
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    default:
      return 'An error occurred. Please try again';
  }
};
