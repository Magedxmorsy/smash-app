import { submitFeedback } from '../feedbackService';

// Mock the firestore service
jest.mock('../firestoreService', () => ({
  createDocument: jest.fn()
}));

describe('feedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully with valid data', async () => {
      const mockCreateDocument = require('../firestoreService').createDocument;
      mockCreateDocument.mockResolvedValue({ id: 'test-id', error: null });

      const feedbackData = {
        type: 'bug',
        subject: 'Test subject',
        message: 'Test message',
        email: 'test@example.com',
        userId: 'test-user'
      };

      const result = await submitFeedback(feedbackData);

      expect(result.success).toBe(true);
      expect(result.error).toBe(null);
      expect(mockCreateDocument).toHaveBeenCalledWith('feedback', expect.objectContaining({
        type: 'bug',
        subject: 'Test subject',
        message: 'Test message',
        email: 'test@example.com',
        userId: 'test-user'
      }));
    });

    it('should return error for missing required fields', async () => {
      const feedbackData = {
        type: '',
        subject: '',
        message: ''
      };

      const result = await submitFeedback(feedbackData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please fill in all required fields');
    });

    it('should return error for subject too long', async () => {
      const feedbackData = {
        type: 'bug',
        subject: 'a'.repeat(101),
        message: 'Test message'
      };

      const result = await submitFeedback(feedbackData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Subject must be less than 100 characters');
    });

    it('should return error for message too long', async () => {
      const feedbackData = {
        type: 'bug',
        subject: 'Test subject',
        message: 'a'.repeat(1001)
      };

      const result = await submitFeedback(feedbackData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Message must be less than 1000 characters');
    });

    it('should return error for invalid email format', async () => {
      const feedbackData = {
        type: 'bug',
        subject: 'Test subject',
        message: 'Test message',
        email: 'invalid-email'
      };

      const result = await submitFeedback(feedbackData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should handle firestore service errors', async () => {
      const mockCreateDocument = require('../firestoreService').createDocument;
      mockCreateDocument.mockResolvedValue({ id: null, error: 'Firestore error' });

      const feedbackData = {
        type: 'bug',
        subject: 'Test subject',
        message: 'Test message'
      };

      const result = await submitFeedback(feedbackData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to submit feedback. Please try again.');
    });
  });
});