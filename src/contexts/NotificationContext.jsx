import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToNotifications,
  markAsRead as markNotificationAsRead,
  markAllAsRead as markAllNotificationsAsRead,
  deleteNotification as deleteNotificationById
} from '../services/notificationService';
import {
  subscribeToNotificationSettings,
  saveNotificationSettings
} from '../services/notificationSettingsService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    allNotifications: true,
    tournamentNotifications: true,
    teamNotifications: true,
    matchNotifications: true
  });
  const [loading, setLoading] = useState(true);

  // Subscribe to user's notifications
  useEffect(() => {
    if (!userData?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let unsubscribe;

    try {
      unsubscribe = subscribeToNotifications(userData.uid, (notifs) => {
        setNotifications(notifs);
        setLoading(false);
      });
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      setNotifications([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData?.uid]);

  // Subscribe to user's notification settings
  useEffect(() => {
    if (!userData?.uid) {
      // Reset to default settings if no user
      setSettings({
        allNotifications: true,
        tournamentNotifications: true,
        teamNotifications: true,
        matchNotifications: true
      });
      return;
    }

    let unsubscribe;

    try {
      unsubscribe = subscribeToNotificationSettings(userData.uid, (newSettings) => {
        setSettings(newSettings);
      });
    } catch (error) {
      console.error('Failed to subscribe to notification settings:', error);
      // Use default settings on error
      setSettings({
        allNotifications: true,
        tournamentNotifications: true,
        teamNotifications: true,
        matchNotifications: true
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData?.uid]);

  // Filter notifications based on user settings
  const filteredNotifications = useMemo(() => {
    if (!settings.allNotifications) {
      return [];
    }

    return notifications.filter(notif => {
      // Check if this notification type is enabled
      if (notif.type === 'tournament' && !settings.tournamentNotifications) {
        return false;
      }
      if (notif.type === 'team' && !settings.teamNotifications) {
        return false;
      }
      if (notif.type === 'match' && !settings.matchNotifications) {
        return false;
      }
      return true;
    });
  }, [notifications, settings]);

  // Calculate unread count from filtered notifications
  const unreadCount = useMemo(() => {
    return filteredNotifications.filter(n => !n.read).length;
  }, [filteredNotifications]);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!userData?.uid) return;

    const { error } = await markNotificationAsRead(userData.uid, notificationId);
    if (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userData?.uid) return;

    const { error } = await markAllNotificationsAsRead(userData.uid);
    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    if (!userData?.uid) return;

    const { error } = await deleteNotificationById(userData.uid, notificationId);
    if (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Update notification settings
  const updateSettings = async (newSettings) => {
    if (!userData?.uid) return;

    const { error } = await saveNotificationSettings(userData.uid, newSettings);
    if (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  // Refresh notifications (manual refresh if needed)
  const refreshNotifications = () => {
    // Real-time listener will automatically update
    // This function is here for compatibility if needed
  };

  const value = {
    notifications: filteredNotifications,
    unreadCount,
    loading,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
