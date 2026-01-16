import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, EmailAuthProvider, reauthenticateWithCredential } from '../config/firebase';
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
        } else {
          // Edge case: Auth user exists but no Firestore document
          // This means the Firestore document was deleted but Auth user remains (orphaned account)
          console.warn('⚠️ Orphaned Firebase Auth user detected (no Firestore document)');
          console.warn('⚠️ Email:', email);
          console.warn('⚠️ This is an incomplete signup - Firestore document was deleted');

          // Return a specific error asking user to contact support or try different email
          return {
            success: false,
            user: null,
            uid: null,
            verificationCode: null,
            error: 'This email has an incomplete account. Please delete the user from Firebase Authentication Console or try a different email.'
          };
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
    return { success: true, error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: error.message };
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
    console.log('📧 [checkEmailExists] Starting check for email:', email);
    console.log('📧 [checkEmailExists] Firestore DB instance:', !!db);

    // Check Firestore directly (most reliable method)
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));

    console.log('📧 [checkEmailExists] Query created, fetching docs...');
    const querySnapshot = await getDocs(q);

    console.log('📊 [checkEmailExists] Firestore query result:', {
      found: !querySnapshot.empty,
      count: querySnapshot.size,
      timestamp: new Date().toISOString()
    });

    if (!querySnapshot.empty) {
      const docIds = querySnapshot.docs.map(doc => doc.id);
      const userData = querySnapshot.docs[0].data();
      console.log('👤 [checkEmailExists] User(s) found in Firestore:', {
        documentIds: docIds,
        email: userData.email,
        hasPassword: !!userData.passwordSet,
        profileComplete: !!userData.profileComplete,
        emailVerified: !!userData.emailVerified,
        createdAt: userData.createdAt,
        allDocs: querySnapshot.docs.map(doc => ({ id: doc.id, email: doc.data().email }))
      });

      // If account exists in Firestore, it means the user already created an account
      // They should login, not signup again
      console.log('✅ [checkEmailExists] Account exists - user should login');
      return { exists: true, error: null };
    }

    console.log('✅ [checkEmailExists] No user found in Firestore for email:', email);
    return { exists: false, error: null };
  } catch (error) {
    console.error('❌ [checkEmailExists] Error:', error);
    console.error('❌ [checkEmailExists] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
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
    console.log('🔧 [completeUserProfile] Starting with:', { uid, profileData });
    const { firstName, lastName, avatarUri } = profileData;

    // If uid is null, use current user's uid
    const user = auth.currentUser;
    const userId = uid || user?.uid;

    console.log('🔧 [completeUserProfile] User ID:', userId);

    if (!userId) {
      console.error('❌ [completeUserProfile] No user ID available');
      return { success: false, error: 'No user ID available' };
    }

    let avatarUrl = avatarUri;

    // If avatarUri is a local file (starts with file:// or doesn't start with http), upload to Storage
    if (avatarUri && !avatarUri.startsWith('http')) {
      console.log('📤 [completeUserProfile] Uploading avatar to Storage...');
      // Import uploadImageFromUri from storageService
      const { uploadImageFromUri } = require('./storageService');

      // Upload to Firebase Storage under profileImages/{userId}
      const uploadPath = `profileImages/${userId}/avatar.jpg`;
      const uploadResult = await uploadImageFromUri(avatarUri, uploadPath);

      if (uploadResult.error) {
        console.error('❌ [completeUserProfile] Avatar upload failed:', uploadResult.error);
        return { success: false, error: `Failed to upload avatar: ${uploadResult.error}` };
      }

      avatarUrl = uploadResult.url; // Use the cloud download URL
      console.log('✅ [completeUserProfile] Avatar uploaded successfully:', avatarUrl);
    }

    console.log('📝 [completeUserProfile] Updating Firestore document...');
    // Update user document with profile information
    await updateDoc(doc(db, 'users', userId), {
      firstName: firstName,
      lastName: lastName,
      displayName: `${firstName} ${lastName}`,
      avatarUri: avatarUrl || null,
      profileComplete: true,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ [completeUserProfile] Firestore document updated');

    // Update Firebase Auth profile
    if (user) {
      console.log('📝 [completeUserProfile] Updating Firebase Auth profile...');
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: avatarUrl || null, // Also update Firebase Auth photoURL
      });
      console.log('✅ [completeUserProfile] Firebase Auth profile updated');
    }

    console.log('✅ [completeUserProfile] Profile completed successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ [completeUserProfile] Error:', error);
    console.error('❌ [completeUserProfile] Error stack:', error.stack);
    return { success: false, error: error.message };
  }
};

/**
 * Update user profile information
 * This updates an existing user's profile data and propagates changes to all related documents
 */
export const updateUserProfile = async (uid, profileData) => {
  try {
    const { firstName, lastName, avatarUri } = profileData;

    let avatarUrl = avatarUri;

    // If avatarUri is a local file (starts with file:// or doesn't start with http), upload to Storage
    if (avatarUri && !avatarUri.startsWith('http')) {
      // Import uploadImageFromUri from storageService
      const { uploadImageFromUri } = require('./storageService');

      // Upload to Firebase Storage under profileImages/{uid}
      const uploadPath = `profileImages/${uid}/avatar.jpg`;
      const uploadResult = await uploadImageFromUri(avatarUri, uploadPath);

      if (uploadResult.error) {
        return { success: false, error: `Failed to upload avatar: ${uploadResult.error}` };
      }

      avatarUrl = uploadResult.url; // Use the cloud download URL
    }

    // Update user document with profile information
    await updateDoc(doc(db, 'users', uid), {
      firstName: firstName,
      lastName: lastName,
      displayName: `${firstName} ${lastName}`,
      avatarUri: avatarUrl !== undefined ? avatarUrl : null,
      updatedAt: new Date().toISOString(),
    });

    // Update Firebase Auth profile
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: avatarUrl || null, // Also update Firebase Auth photoURL
      });
    }

    // Propagate profile changes to all tournaments where user is a participant
    await propagateProfileChangesToTournaments(uid, firstName, lastName, avatarUrl);

    // Propagate profile changes to recent notifications
    await propagateProfileChangesToNotifications(uid, firstName, lastName, avatarUrl);

    return { success: true, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Propagate user profile changes to all tournaments where user is a participant
 * Updates both teams and matches arrays
 */
const propagateProfileChangesToTournaments = async (userId, firstName, lastName, avatarUrl) => {
  try {
    console.log('🔄 Propagating profile changes to tournaments for user:', userId);

    // Query all tournaments
    const tournamentsRef = collection(db, 'tournaments');
    const tournamentsSnapshot = await getDocs(tournamentsRef);

    let updateCount = 0;

    for (const tournamentDoc of tournamentsSnapshot.docs) {
      const tournamentData = tournamentDoc.data();
      let hasChanges = false;
      const updates = {};

      // Update teams array
      if (tournamentData.teams && Array.isArray(tournamentData.teams)) {
        const updatedTeams = tournamentData.teams.map(team => {
          let teamUpdated = false;

          // Check and update player1
          if (team.player1?.userId === userId) {
            team.player1.firstName = firstName;
            team.player1.lastName = lastName;
            team.player1.avatarUri = avatarUrl;
            teamUpdated = true;
          }

          // Check and update player2
          if (team.player2?.userId === userId) {
            team.player2.firstName = firstName;
            team.player2.lastName = lastName;
            team.player2.avatarUri = avatarUrl;
            teamUpdated = true;
          }

          if (teamUpdated) hasChanges = true;
          return team;
        });

        if (hasChanges) {
          updates.teams = updatedTeams;
        }
      }

      // Update matches array
      if (tournamentData.matches && Array.isArray(tournamentData.matches)) {
        const updatedMatches = tournamentData.matches.map(match => {
          let matchUpdated = false;

          // Update team1 players
          if (match.team1?.player1?.userId === userId) {
            match.team1.player1.firstName = firstName;
            match.team1.player1.lastName = lastName;
            match.team1.player1.avatarUri = avatarUrl;
            matchUpdated = true;
          }
          if (match.team1?.player2?.userId === userId) {
            match.team1.player2.firstName = firstName;
            match.team1.player2.lastName = lastName;
            match.team1.player2.avatarUri = avatarUrl;
            matchUpdated = true;
          }

          // Update team2 players
          if (match.team2?.player1?.userId === userId) {
            match.team2.player1.firstName = firstName;
            match.team2.player1.lastName = lastName;
            match.team2.player1.avatarUri = avatarUrl;
            matchUpdated = true;
          }
          if (match.team2?.player2?.userId === userId) {
            match.team2.player2.firstName = firstName;
            match.team2.player2.lastName = lastName;
            match.team2.player2.avatarUri = avatarUrl;
            matchUpdated = true;
          }

          if (matchUpdated) hasChanges = true;
          return match;
        });

        if (hasChanges) {
          updates.matches = updatedMatches;
        }
      }

      // Update groups array (for GROUP_STAGE tournaments)
      if (tournamentData.groups && Array.isArray(tournamentData.groups)) {
        const updatedGroups = tournamentData.groups.map(group => {
          if (group.teams && Array.isArray(group.teams)) {
            const updatedGroupTeams = group.teams.map(team => {
              let teamUpdated = false;

              // Check and update player1
              if (team.player1?.userId === userId) {
                team.player1.firstName = firstName;
                team.player1.lastName = lastName;
                team.player1.avatarUri = avatarUrl;
                teamUpdated = true;
              }

              // Check and update player2
              if (team.player2?.userId === userId) {
                team.player2.firstName = firstName;
                team.player2.lastName = lastName;
                team.player2.avatarUri = avatarUrl;
                teamUpdated = true;
              }

              if (teamUpdated) hasChanges = true;
              return team;
            });

            return { ...group, teams: updatedGroupTeams };
          }
          return group;
        });

        if (hasChanges) {
          updates.groups = updatedGroups;
        }
      }

      // Apply updates to this tournament if there were any changes
      if (hasChanges) {
        await updateDoc(doc(db, 'tournaments', tournamentDoc.id), updates);
        updateCount++;
        console.log(`✅ Updated tournament: ${tournamentDoc.id}`);
      }
    }

    console.log(`✅ Profile propagation complete. Updated ${updateCount} tournaments.`);
  } catch (error) {
    console.error('❌ Error propagating profile changes to tournaments:', error);
    // Don't throw - we don't want profile update to fail if propagation fails
  }
};

/**
 * Propagate user profile changes to recent notifications
 * Updates playerInfo in the user's own notifications where they appear
 *
 * Note: We only update the user's own notifications due to Firestore security rules.
 * Notifications in other users' collections will show stale data, but this is acceptable
 * since notifications are typically ephemeral and less critical than tournament data.
 */
const propagateProfileChangesToNotifications = async (userId, firstName, lastName, avatarUrl) => {
  try {
    console.log('🔄 Propagating profile changes to user notifications:', userId);

    // Only update the current user's own notifications
    // This avoids permission issues with other users' notification subcollections
    const notificationsRef = collection(db, 'users', userId, 'notifications');

    // Query for notifications that have playerInfo (where this user might appear)
    const notificationsQuery = query(
      notificationsRef,
      where('playerInfo.firstName', '!=', null)
    );

    const notificationsSnapshot = await getDocs(notificationsQuery);
    let notificationUpdateCount = 0;

    // Date threshold: 30 days ago (only update recent notifications)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const notificationDoc of notificationsSnapshot.docs) {
      const notificationData = notificationDoc.data();

      if (notificationData.playerInfo) {
        const createdAt = new Date(notificationData.createdAt);
        const isRecent = createdAt >= thirtyDaysAgo;

        // Update if notification is recent and avatar doesn't match
        if (isRecent && notificationData.playerInfo.avatarUri !== avatarUrl) {
          await updateDoc(doc(db, 'users', userId, 'notifications', notificationDoc.id), {
            'playerInfo.firstName': firstName,
            'playerInfo.lastName': lastName,
            'playerInfo.avatarUri': avatarUrl,
          });
          notificationUpdateCount++;
        }
      }
    }

    console.log(`✅ Notification propagation complete. Updated ${notificationUpdateCount} notifications.`);
  } catch (error) {
    console.error('❌ Error propagating profile changes to notifications:', error);
    // Don't throw - we don't want profile update to fail if propagation fails
  }
};

/**
 * Change user password
 * Requires reauthentication for security
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;

    if (!user || !user.email) {
      return { success: false, error: 'User not authenticated' };
    }

    // Reauthenticate user with current password (Firebase requirement)
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    return { success: true, error: null };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: getErrorMessage(error.code) };
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
      return 'Current password is incorrect';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/requires-recent-login':
      return 'Please sign in again to change password';
    default:
      return 'An error occurred. Please try again';
  }
};

/**
 * Create account with Firebase email verification (new flow)
 */
export const createAccountWithEmailVerification = async (email, password) => {
  try {
    console.log('📧 Creating account with email verification for:', email);

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create default notification settings
    await createDefaultNotificationSettings(user.uid);

    // Send verification email (using Firebase default settings for now)
    await sendEmailVerification(user);

    console.log('✅ Account created and verification email sent to:', user.email);

    return { success: true, user, error: null };
  } catch (error) {
    console.error('Create account error:', error);
    return { success: false, user: null, error: getErrorMessage(error.code) };
  }
};

/**
 * Resend verification email to current user
 */
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.log('❌ No user logged in');
      return { success: false, error: 'No user logged in' };
    }

    if (user.emailVerified) {
      console.log('❌ Email already verified');
      return { success: false, error: 'Email is already verified' };
    }

    console.log('📧 Sending verification email to:', user.email);

    // Send verification email without custom settings for now (for testing)
    // The actionCodeSettings might be causing issues if domain isn't authorized
    await sendEmailVerification(user);

    console.log('✅ Verification email sent successfully to:', user.email);

    return { success: true, error: null };
  } catch (error) {
    console.error('❌ Resend verification email error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Check if current user's email is verified
 */
export const checkEmailVerificationStatus = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return { verified: false, error: 'No user logged in' };
    }

    // Reload user to get latest emailVerified status
    await reload(user);

    console.log('📧 Email verification status:', user.emailVerified);

    // Update Firestore document with verification status
    if (user.emailVerified) {
      await updateDoc(doc(db, 'users', user.uid), {
        emailVerified: true,
        updatedAt: new Date().toISOString(),
      });
    }

    return { verified: user.emailVerified, error: null };
  } catch (error) {
    console.error('Check email verification error:', error);
    return { verified: false, error: error.message };
  }
};

/**
 * Delete user account
 * Requires reauthentication for security
 * Deletes all user data from Firestore and Firebase Auth
 */
export const deleteAccount = async (currentPassword) => {
  try {
    const user = auth.currentUser;

    if (!user || !user.email) {
      return { success: false, error: 'No user logged in' };
    }

    console.log('🗑️ Starting account deletion process for user:', user.uid);

    // Step 1: Reauthenticate user for security
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      console.log('✅ User reauthenticated successfully');
    } catch (reauthError) {
      console.error('❌ Reauthentication failed:', reauthError);
      if (reauthError.code === 'auth/wrong-password') {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      return { success: false, error: 'Authentication failed. Please try again.' };
    }

    const userId = user.uid;

    // Step 2: Delete user's notifications subcollection
    try {
      const notificationsRef = collection(db, 'users', userId, 'notifications');
      const notificationsSnapshot = await getDocs(notificationsRef);

      console.log(`🗑️ Deleting ${notificationsSnapshot.size} notifications...`);

      const deleteNotificationsPromises = notificationsSnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deleteNotificationsPromises);

      console.log('✅ Notifications deleted');
    } catch (notifError) {
      console.error('⚠️ Error deleting notifications (continuing):', notifError);
      // Continue even if notifications deletion fails
    }

    // Step 3: Handle tournaments - delete hosted ones and remove user from participated ones
    try {
      const tournamentsRef = collection(db, 'tournaments');

      // First, delete all tournaments hosted by this user
      const hostedTournamentsQuery = query(
        tournamentsRef,
        where('hostId', '==', userId)
      );
      const hostedTournamentsSnapshot = await getDocs(hostedTournamentsQuery);

      console.log(`🗑️ Deleting ${hostedTournamentsSnapshot.size} hosted tournaments...`);

      const deleteTournamentPromises = hostedTournamentsSnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deleteTournamentPromises);

      console.log('✅ Hosted tournaments deleted');

      // Then, remove user from tournaments where they're just a participant
      const participantTournamentsQuery = query(
        tournamentsRef,
        where('participantIds', 'array-contains', userId)
      );
      const participantTournamentsSnapshot = await getDocs(participantTournamentsQuery);

      console.log(`🗑️ Removing user from ${participantTournamentsSnapshot.size} tournaments as participant...`);

      for (const tournamentDoc of participantTournamentsSnapshot.docs) {
        const tournamentData = tournamentDoc.data();

        // Skip if this is a hosted tournament (already deleted)
        if (tournamentData.hostId === userId) {
          continue;
        }

        // Remove user from teams
        const updatedTeams = tournamentData.teams?.map(team => {
          const newTeam = { ...team };

          // Remove from player1 position
          if (team.player1?.userId === userId) {
            newTeam.player1 = null;
          }

          // Remove from player2 position
          if (team.player2?.userId === userId) {
            newTeam.player2 = null;
          }

          return newTeam;
        }).filter(team => team.player1 !== null || team.player2 !== null) || []; // Remove empty teams

        // Remove user from participantIds
        const updatedParticipantIds = tournamentData.participantIds?.filter(
          id => id !== userId
        ) || [];

        // Recalculate registered teams
        const registeredTeams = updatedTeams.filter(
          team => team.player1 && team.player2
        ).length;

        // Update tournament
        await updateDoc(tournamentDoc.ref, {
          teams: updatedTeams,
          participantIds: updatedParticipantIds,
          registeredTeams,
          updatedAt: new Date().toISOString()
        });
      }

      console.log('✅ User removed from tournaments');
    } catch (tournamentsError) {
      console.error('⚠️ Error handling tournaments (continuing):', tournamentsError);
      // Continue even if tournament cleanup fails
    }

    // Step 4: Delete user document from Firestore
    try {
      await deleteDoc(doc(db, 'users', userId));
      console.log('✅ User document deleted from Firestore');
    } catch (firestoreError) {
      console.error('⚠️ Error deleting user document:', firestoreError);
      // Continue to delete auth account even if Firestore fails
    }

    // Step 5: Delete Firebase Auth account
    try {
      await deleteUser(user);
      console.log('✅ Firebase Auth account deleted');
    } catch (authError) {
      console.error('❌ Error deleting auth account:', authError);
      return {
        success: false,
        error: 'Failed to delete account. Please try again or contact support.'
      };
    }

    console.log('✅ Account deletion completed successfully');
    return { success: true, error: null };

  } catch (error) {
    console.error('❌ Delete account error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete account. Please try again.'
    };
  }
};
