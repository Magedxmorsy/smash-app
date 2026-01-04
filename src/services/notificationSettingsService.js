import {
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Default notification settings for new users
 */
const DEFAULT_SETTINGS = {
  allNotifications: true,
  tournamentNotifications: true,
  teamNotifications: true,
  matchNotifications: true
};

/**
 * Get user's notification settings
 *
 * @param {string} userId - User ID
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const getUserNotificationSettings = async (userId) => {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'notifications');
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null };
    } else {
      // Return default settings if not found
      return { data: DEFAULT_SETTINGS, error: null };
    }
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Save user's notification settings
 *
 * @param {string} userId - User ID
 * @param {object} settings - Notification settings
 * @param {boolean} settings.allNotifications - Master toggle
 * @param {boolean} settings.tournamentNotifications - Tournament notifications toggle
 * @param {boolean} settings.teamNotifications - Team notifications toggle
 * @param {boolean} settings.matchNotifications - Match notifications toggle
 * @returns {Promise<{error: string|null}>}
 */
export const saveNotificationSettings = async (userId, settings) => {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'notifications');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return { error: null };
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return { error: error.message };
  }
};

/**
 * Create default notification settings for a new user
 *
 * @param {string} userId - User ID
 * @returns {Promise<{error: string|null}>}
 */
export const createDefaultNotificationSettings = async (userId) => {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'notifications');
    await setDoc(settingsRef, {
      ...DEFAULT_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { error: null };
  } catch (error) {
    console.error('Error creating default notification settings:', error);
    return { error: error.message };
  }
};

/**
 * Subscribe to real-time notification settings updates
 *
 * @param {string} userId - User ID
 * @param {function} callback - Callback function that receives settings object
 * @returns {function} Unsubscribe function
 */
export const subscribeToNotificationSettings = (userId, callback) => {
  if (!userId) {
    console.warn('subscribeToNotificationSettings: userId is required');
    callback(DEFAULT_SETTINGS);
    return () => {}; // Return empty unsubscribe function
  }

  const settingsRef = doc(db, 'users', userId, 'settings', 'notifications');

  return onSnapshot(
    settingsRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback(docSnapshot.data());
      } else {
        // Document doesn't exist yet - just use defaults without trying to create
        // Settings will be created when the user updates them for the first time
        callback(DEFAULT_SETTINGS);
      }
    },
    (error) => {
      // Handle permissions errors gracefully
      if (error.code === 'permission-denied') {
        // This is expected when user document doesn't exist yet
        // Just silently use default settings
      } else {
        console.error('Error in settings subscription:', error.message);
      }
      // Still provide default settings to prevent app from breaking
      callback(DEFAULT_SETTINGS);
    }
  );
};
