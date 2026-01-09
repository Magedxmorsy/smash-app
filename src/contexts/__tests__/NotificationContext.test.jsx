/**
 * Tests for NotificationContext
 * Verifies that notification settings properly filter displayed notifications
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { NotificationProvider, useNotifications } from '../NotificationContext';
import { useAuth } from '../AuthContext';
import * as notificationService from '../../services/notificationService';
import * as notificationSettingsService from '../../services/notificationSettingsService';

// Mock the services
jest.mock('../../services/notificationService');
jest.mock('../../services/notificationSettingsService');
jest.mock('../AuthContext');

describe('NotificationContext - Settings Integration', () => {
  const mockUserId = 'user123';

  // Mock notifications of different types
  const mockNotifications = [
    {
      id: 'notif1',
      type: 'tournament',
      title: 'Tournament Created',
      message: 'New tournament: Summer Smash',
      read: false,
      createdAt: new Date('2025-12-15T10:00:00'),
    },
    {
      id: 'notif2',
      type: 'team',
      title: 'Team Invite',
      message: 'You have been invited to join a team',
      read: false,
      createdAt: new Date('2025-12-15T11:00:00'),
    },
    {
      id: 'notif3',
      type: 'match',
      title: 'Match Scheduled',
      message: 'Your match starts in 30 minutes',
      read: false,
      createdAt: new Date('2025-12-15T12:00:00'),
    },
    {
      id: 'notif4',
      type: 'tournament',
      title: 'Tournament Started',
      message: 'Summer Smash has started',
      read: true,
      createdAt: new Date('2025-12-15T13:00:00'),
    },
  ];

  const wrapper = ({ children }) => <NotificationProvider>{children}</NotificationProvider>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAuth to return authenticated user
    useAuth.mockReturnValue({
      userData: { uid: mockUserId },
    });
  });

  it('should show all notifications when all settings are enabled', async () => {
    // Setup: All notifications enabled
    let notificationCallback;
    let settingsCallback;

    notificationService.subscribeToNotifications.mockImplementation((userId, callback) => {
      notificationCallback = callback;
      return jest.fn(); // unsubscribe function
    });

    notificationSettingsService.subscribeToNotificationSettings.mockImplementation((userId, callback) => {
      settingsCallback = callback;
      return jest.fn(); // unsubscribe function
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    // Simulate receiving notifications and settings
    act(() => {
      notificationCallback(mockNotifications);
      settingsCallback({
        allNotifications: true,
        tournamentNotifications: true,
        teamNotifications: true,
        matchNotifications: true,
      });
    });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(4);
      expect(result.current.unreadCount).toBe(3);
    });
  });

  it('should hide all notifications when master toggle is off', async () => {
    let notificationCallback;
    let settingsCallback;

    notificationService.subscribeToNotifications.mockImplementation((userId, callback) => {
      notificationCallback = callback;
      return jest.fn();
    });

    notificationSettingsService.subscribeToNotificationSettings.mockImplementation((userId, callback) => {
      settingsCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      notificationCallback(mockNotifications);
      settingsCallback({
        allNotifications: false, // Master toggle OFF
        tournamentNotifications: true,
        teamNotifications: true,
        matchNotifications: true,
      });
    });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  it('should filter out tournament notifications when disabled', async () => {
    let notificationCallback;
    let settingsCallback;

    notificationService.subscribeToNotifications.mockImplementation((userId, callback) => {
      notificationCallback = callback;
      return jest.fn();
    });

    notificationSettingsService.subscribeToNotificationSettings.mockImplementation((userId, callback) => {
      settingsCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      notificationCallback(mockNotifications);
      settingsCallback({
        allNotifications: true,
        tournamentNotifications: false, // Tournament notifications OFF
        teamNotifications: true,
        matchNotifications: true,
      });
    });

    await waitFor(() => {
      // Should have 2 notifications (team + match), excluding 2 tournament notifications
      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications.every(n => n.type !== 'tournament')).toBe(true);
      expect(result.current.unreadCount).toBe(2); // Only unread team and match
    });
  });

  it('should filter out team notifications when disabled', async () => {
    let notificationCallback;
    let settingsCallback;

    notificationService.subscribeToNotifications.mockImplementation((userId, callback) => {
      notificationCallback = callback;
      return jest.fn();
    });

    notificationSettingsService.subscribeToNotificationSettings.mockImplementation((userId, callback) => {
      settingsCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      notificationCallback(mockNotifications);
      settingsCallback({
        allNotifications: true,
        tournamentNotifications: true,
        teamNotifications: false, // Team notifications OFF
        matchNotifications: true,
      });
    });

    await waitFor(() => {
      // Should have 3 notifications (tournament x2 + match), excluding team
      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.notifications.every(n => n.type !== 'team')).toBe(true);
    });
  });

  it('should filter out match notifications when disabled', async () => {
    let notificationCallback;
    let settingsCallback;

    notificationService.subscribeToNotifications.mockImplementation((userId, callback) => {
      notificationCallback = callback;
      return jest.fn();
    });

    notificationSettingsService.subscribeToNotificationSettings.mockImplementation((userId, callback) => {
      settingsCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      notificationCallback(mockNotifications);
      settingsCallback({
        allNotifications: true,
        tournamentNotifications: true,
        teamNotifications: true,
        matchNotifications: false, // Match notifications OFF
      });
    });

    await waitFor(() => {
      // Should have 3 notifications (tournament x2 + team), excluding match
      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.notifications.every(n => n.type !== 'match')).toBe(true);
    });
  });

  it('should apply multiple filters simultaneously', async () => {
    let notificationCallback;
    let settingsCallback;

    notificationService.subscribeToNotifications.mockImplementation((userId, callback) => {
      notificationCallback = callback;
      return jest.fn();
    });

    notificationSettingsService.subscribeToNotificationSettings.mockImplementation((userId, callback) => {
      settingsCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      notificationCallback(mockNotifications);
      settingsCallback({
        allNotifications: true,
        tournamentNotifications: true,
        teamNotifications: false, // Team OFF
        matchNotifications: false, // Match OFF
      });
    });

    await waitFor(() => {
      // Should only show tournament notifications
      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications.every(n => n.type === 'tournament')).toBe(true);
      expect(result.current.unreadCount).toBe(1); // Only 1 unread tournament notification
    });
  });

  it('should update settings when updateSettings is called', async () => {
    let notificationCallback;
    let settingsCallback;

    notificationService.subscribeToNotifications.mockImplementation((userId, callback) => {
      notificationCallback = callback;
      return jest.fn();
    });

    notificationSettingsService.subscribeToNotificationSettings.mockImplementation((userId, callback) => {
      settingsCallback = callback;
      return jest.fn();
    });

    notificationSettingsService.saveNotificationSettings.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      notificationCallback(mockNotifications);
      settingsCallback({
        allNotifications: true,
        tournamentNotifications: true,
        teamNotifications: true,
        matchNotifications: true,
      });
    });

    // Update settings
    await act(async () => {
      await result.current.updateSettings({
        allNotifications: true,
        tournamentNotifications: false,
        teamNotifications: true,
        matchNotifications: true,
      });
    });

    // Verify saveNotificationSettings was called
    expect(notificationSettingsService.saveNotificationSettings).toHaveBeenCalledWith(
      mockUserId,
      {
        allNotifications: true,
        tournamentNotifications: false,
        teamNotifications: true,
        matchNotifications: true,
      }
    );
  });

  it('should calculate unread count correctly based on filtered notifications', async () => {
    const mixedNotifications = [
      { id: '1', type: 'tournament', read: false },
      { id: '2', type: 'tournament', read: true },
      { id: '3', type: 'team', read: false },
      { id: '4', type: 'match', read: false },
      { id: '5', type: 'match', read: true },
    ];

    let notificationCallback;
    let settingsCallback;

    notificationService.subscribeToNotifications.mockImplementation((userId, callback) => {
      notificationCallback = callback;
      return jest.fn();
    });

    notificationSettingsService.subscribeToNotificationSettings.mockImplementation((userId, callback) => {
      settingsCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      notificationCallback(mixedNotifications);
      settingsCallback({
        allNotifications: true,
        tournamentNotifications: true,
        teamNotifications: false, // Filter out team
        matchNotifications: true,
      });
    });

    await waitFor(() => {
      // Should show: 2 tournament + 2 match = 4 total
      // Unread: 1 tournament + 1 match = 2 unread
      expect(result.current.notifications).toHaveLength(4);
      expect(result.current.unreadCount).toBe(2);
    });
  });

  it('should return empty array when user is not authenticated', async () => {
    useAuth.mockReturnValue({
      userData: null, // No user
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.loading).toBe(false);
    });
  });
});
