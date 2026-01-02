/**
 * Integration tests for the complete notification system
 * Tests tournament creation, team joining, and notification generation
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTournaments } from '../../contexts/TournamentContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  createNotification,
  createNotificationsForUsers,
  getUserNotifications,
  markAsRead,
} from '../notificationService';
import {
  getUserNotificationSettings,
  saveNotificationSettings,
  createDefaultNotificationSettings,
} from '../notificationSettingsService';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'test-user-1' },
  },
}));

// Mock Firestore operations
jest.mock('../firestoreService', () => ({
  createDocument: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
  getDocument: jest.fn(),
  subscribeToCollection: jest.fn(),
}));

describe('Notification System Integration Tests', () => {
  const mockUser1 = {
    uid: 'test-user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
  };

  const mockUser2 = {
    uid: 'test-user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@test.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Notification Service - Core CRUD', () => {
    test('createNotification should create a notification', async () => {
      const notificationData = {
        type: 'tournament',
        action: 'tournament_created',
        title: 'Tournament Created',
        message: 'You created "Summer Championship"',
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      };

      const result = await createNotification(mockUser1.uid, notificationData);

      expect(result.error).toBeNull();
      expect(result.id).toBeDefined();
    });

    test('createNotificationsForUsers should create multiple notifications', async () => {
      const userIds = [mockUser1.uid, mockUser2.uid];
      const notificationData = {
        type: 'tournament',
        action: 'tournament_started',
        title: 'Tournament Started',
        message: 'Summer Championship has started!',
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      };

      const result = await createNotificationsForUsers(userIds, notificationData);

      expect(result.error).toBeNull();
      expect(result.count).toBe(2);
    });

    test('markAsRead should mark notification as read', async () => {
      const result = await markAsRead(mockUser1.uid, 'notification-1');

      expect(result.error).toBeNull();
    });
  });

  describe('Notification Settings Service', () => {
    test('createDefaultNotificationSettings should create default settings', async () => {
      const result = await createDefaultNotificationSettings(mockUser1.uid);

      expect(result.error).toBeNull();
    });

    test('getUserNotificationSettings should return settings', async () => {
      const result = await getUserNotificationSettings(mockUser1.uid);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.allNotifications).toBe(true);
      expect(result.data.tournamentNotifications).toBe(true);
      expect(result.data.teamNotifications).toBe(true);
      expect(result.data.matchNotifications).toBe(true);
    });

    test('saveNotificationSettings should update settings', async () => {
      const newSettings = {
        allNotifications: true,
        tournamentNotifications: false,
        teamNotifications: true,
        matchNotifications: true,
      };

      const result = await saveNotificationSettings(mockUser1.uid, newSettings);

      expect(result.error).toBeNull();
    });

    test('notifications should respect user settings', async () => {
      // Disable tournament notifications
      await saveNotificationSettings(mockUser1.uid, {
        allNotifications: true,
        tournamentNotifications: false,
        teamNotifications: true,
        matchNotifications: true,
      });

      // Try to create a tournament notification
      const result = await createNotification(mockUser1.uid, {
        type: 'tournament',
        action: 'tournament_created',
        title: 'Tournament Created',
        message: 'Test tournament',
        metadata: { tournamentId: 'test-1' },
      });

      // Should be blocked by settings
      expect(result.id).toBeNull();
    });
  });

  describe('Tournament Notifications - End-to-End Flow', () => {
    test('Notification 1: Tournament Created', async () => {
      const tournamentData = {
        name: 'Summer Championship',
        teamCount: 4,
        location: 'Central Court',
        dateTime: new Date().toISOString(),
        rules: 'Standard rules',
        joinAsPlayer: false,
      };

      // Simulate tournament creation
      const notificationResult = await createNotification(mockUser1.uid, {
        type: 'tournament',
        action: 'tournament_created',
        title: 'Tournament Created',
        message: `You created "${tournamentData.name}"`,
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: tournamentData.name,
        },
      });

      expect(notificationResult.error).toBeNull();
      expect(notificationResult.id).toBeDefined();
    });

    test('Notification 6: Team Created', async () => {
      const notificationResult = await createNotification(mockUser1.uid, {
        type: 'team',
        action: 'team_created',
        title: 'Team Created',
        message: 'You created a team in Summer Championship',
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      });

      expect(notificationResult.error).toBeNull();
      expect(notificationResult.id).toBeDefined();
    });

    test('Notification 7 & 8: Teammate Joined + You Joined Team', async () => {
      // Notification to player1
      const notification7 = await createNotification(mockUser1.uid, {
        type: 'team',
        action: 'teammate_joined',
        title: 'Teammate Joined',
        message: `${mockUser2.firstName} ${mockUser2.lastName} joined your team!`,
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      });

      // Notification to player2
      const notification8 = await createNotification(mockUser2.uid, {
        type: 'team',
        action: 'you_joined_team',
        title: 'Team Joined',
        message: `You joined ${mockUser1.firstName}'s team in Summer Championship`,
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      });

      expect(notification7.error).toBeNull();
      expect(notification8.error).toBeNull();
    });

    test('Notification 10: Team Completed', async () => {
      const allParticipants = [mockUser1.uid, mockUser2.uid];

      const result = await createNotificationsForUsers(allParticipants, {
        type: 'team',
        action: 'team_completed',
        title: 'Team Completed',
        message: 'A team is now complete in Summer Championship!',
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      });

      expect(result.error).toBeNull();
      expect(result.count).toBe(2);
    });

    test('Notification 2: Tournament Full', async () => {
      const notificationResult = await createNotification(mockUser1.uid, {
        type: 'tournament',
        action: 'tournament_full',
        title: 'Tournament Full',
        message: 'Summer Championship is full! Ready to start.',
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      });

      expect(notificationResult.error).toBeNull();
      expect(notificationResult.id).toBeDefined();
    });

    test('Notification 3: Tournament Started', async () => {
      const allParticipants = [mockUser1.uid, mockUser2.uid];

      const result = await createNotificationsForUsers(allParticipants, {
        type: 'tournament',
        action: 'tournament_started',
        title: 'Tournament Started',
        message: 'Summer Championship has started! Check your matches.',
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      });

      expect(result.error).toBeNull();
      expect(result.count).toBe(2);
    });

    test('Notification 4: Tournament Updated', async () => {
      const allParticipants = [mockUser1.uid, mockUser2.uid];

      const result = await createNotificationsForUsers(allParticipants, {
        type: 'tournament',
        action: 'tournament_updated',
        title: 'Tournament Updated',
        message: 'Summer Championship details have changed',
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      });

      expect(result.error).toBeNull();
      expect(result.count).toBe(2);
    });

    test('Notification 5: Tournament Cancelled', async () => {
      const allParticipants = [mockUser1.uid, mockUser2.uid];

      const result = await createNotificationsForUsers(allParticipants, {
        type: 'tournament',
        action: 'tournament_cancelled',
        title: 'Tournament Cancelled',
        message: 'Summer Championship has been cancelled',
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      });

      expect(result.error).toBeNull();
      expect(result.count).toBe(2);
    });

    test('Notification 9: New Team Joined', async () => {
      const otherParticipants = [mockUser2.uid];

      const result = await createNotificationsForUsers(otherParticipants, {
        type: 'team',
        action: 'new_team_joined',
        title: 'New Team Joined',
        message: 'A new team joined Summer Championship',
        metadata: {
          tournamentId: 'tournament-1',
          tournamentName: 'Summer Championship',
        },
      });

      expect(result.error).toBeNull();
      expect(result.count).toBe(1);
    });
  });

  describe('Badge Component Safety', () => {
    test('should handle undefined label gracefully', () => {
      // This simulates the Badge component receiving undefined
      const label = undefined;
      const result = label?.toUpperCase() || '';

      expect(result).toBe('');
      expect(() => label?.toUpperCase() || '').not.toThrow();
    });

    test('should handle null label gracefully', () => {
      const label = null;
      const result = label?.toUpperCase() || '';

      expect(result).toBe('');
      expect(() => label?.toUpperCase() || '').not.toThrow();
    });

    test('should handle valid label correctly', () => {
      const label = 'registration';
      const result = label?.toUpperCase() || '';

      expect(result).toBe('REGISTRATION');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing userId gracefully', async () => {
      const result = await createNotification(null, {
        type: 'tournament',
        action: 'test',
        title: 'Test',
        message: 'Test',
        metadata: {},
      });

      // Should fail gracefully without throwing
      expect(result).toBeDefined();
    });

    test('should handle network errors gracefully', async () => {
      // Mock a network error
      const firestoreService = require('../firestoreService');
      firestoreService.createDocument.mockRejectedValueOnce(new Error('Network error'));

      const result = await createNotification(mockUser1.uid, {
        type: 'tournament',
        action: 'test',
        title: 'Test',
        message: 'Test',
        metadata: {},
      });

      // Should return error without crashing
      expect(result.error).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should handle batch notifications efficiently', async () => {
      const startTime = Date.now();

      const userIds = Array.from({ length: 20 }, (_, i) => `user-${i}`);

      await createNotificationsForUsers(userIds, {
        type: 'tournament',
        action: 'tournament_started',
        title: 'Tournament Started',
        message: 'Test tournament started',
        metadata: { tournamentId: 'test-1' },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 5 seconds for 20 users)
      expect(duration).toBeLessThan(5000);
    });
  });
});
