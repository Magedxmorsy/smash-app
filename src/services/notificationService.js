import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUserNotificationSettings } from './notificationSettingsService';

/**
 * Create a notification for a single user
 * Checks user's notification settings before creating
 *
 * @param {string} userId - User ID to create notification for
 * @param {object} notificationData - Notification data
 * @param {string} notificationData.type - Type: 'tournament', 'team', or 'match'
 * @param {string} notificationData.action - Action type (e.g., 'tournament_created')
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {object} notificationData.metadata - Additional metadata
 * @returns {Promise<{id: string|null, error: string|null}>}
 */
export const createNotification = async (userId, notificationData) => {
  try {
    // Get user's notification settings
    const { data: settings, error: settingsError } = await getUserNotificationSettings(userId);

    if (settingsError) {
      console.warn(`Could not fetch notification settings for user ${userId}:`, settingsError);
      // Continue anyway - don't block notification creation
    }

    // Check if user has notifications enabled for this type
    if (settings) {
      const typeEnabled = {
        tournament: settings.tournamentNotifications,
        team: settings.teamNotifications,
        match: settings.matchNotifications
      }[notificationData.type];

      // Don't create notification if category is disabled
      if (!settings.allNotifications || !typeEnabled) {
        console.log(`Notification blocked by user settings: ${notificationData.type} for user ${userId}`);
        return { id: null, error: null };
      }
    }

    // Create notification in user's subcollection
    const notificationRef = collection(db, 'users', userId, 'notifications');
    const docRef = await addDoc(notificationRef, {
      ...notificationData,
      userId,
      read: false,
      createdAt: new Date().toISOString()
    });

    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { id: null, error: error.message };
  }
};

/**
 * Create notifications for multiple users (batch operation)
 *
 * @param {string[]} userIds - Array of user IDs
 * @param {object} notificationData - Notification data (same structure as createNotification)
 * @returns {Promise<{count: number, error: string|null}>}
 */
export const createNotificationsForUsers = async (userIds, notificationData) => {
  try {
    // Filter out duplicates
    const uniqueUserIds = [...new Set(userIds)];

    // Create notifications one by one (checking settings for each user)
    const promises = uniqueUserIds.map(userId =>
      createNotification(userId, notificationData)
    );

    const results = await Promise.all(promises);

    // Count successful creations (those with an ID)
    const successCount = results.filter(result => result.id !== null).length;

    return { count: successCount, error: null };
  } catch (error) {
    console.error('Error creating batch notifications:', error);
    return { count: 0, error: error.message };
  }
};

/**
 * Get user's notifications with pagination
 *
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of notifications to fetch (default: 100)
 * @returns {Promise<{data: array, error: string|null}>}
 */
export const getUserNotifications = async (userId, limitCount = 100) => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const notifications = [];

    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    return { data: notifications, error: null };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Mark a notification as read
 *
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<{error: string|null}>}
 */
export const markAsRead = async (userId, notificationId) => {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date().toISOString()
    });

    return { error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { error: error.message };
  }
};

/**
 * Mark all notifications as read for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<{error: string|null}>}
 */
export const markAllAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString()
      });
    });

    await batch.commit();

    return { error: null };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { error: error.message };
  }
};

/**
 * Delete a notification
 *
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<{error: string|null}>}
 */
export const deleteNotification = async (userId, notificationId) => {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await deleteDoc(notificationRef);

    return { error: null };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { error: error.message };
  }
};

/**
 * Delete old notifications (30+ days old)
 *
 * @param {string} userId - User ID
 * @returns {Promise<{deleted: number, error: string|null}>}
 */
export const cleanupOldNotifications = async (userId) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString();

    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(
      notificationsRef,
      where('createdAt', '<', cutoffDate)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { deleted: querySnapshot.size, error: null };
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    return { deleted: 0, error: error.message };
  }
};

/**
 * Subscribe to real-time notification updates
 *
 * @param {string} userId - User ID
 * @param {function} callback - Callback function that receives notifications array
 * @returns {function} Unsubscribe function
 */
export const subscribeToNotifications = (userId, callback) => {
  if (!userId) {
    console.warn('subscribeToNotifications: userId is required');
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(
    notificationsRef,
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      callback(notifications);
    },
    (error) => {
      // Handle permissions errors gracefully
      if (error.code === 'permission-denied') {
        console.warn('Permission denied for notifications. This may happen if the user document does not exist yet. Returning empty notifications.');
      } else {
        console.error('Error in notifications subscription:', error.message);
      }
      // Return empty array to prevent app from breaking
      callback([]);
    }
  );
};
