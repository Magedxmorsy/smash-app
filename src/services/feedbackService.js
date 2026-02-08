import { createDocument } from './firestoreService';

/**
 * Submit feedback to Firestore
 * @param {Object} feedbackData - Feedback data
 * @param {string} feedbackData.type - Type of feedback ('bug', 'feature', 'general')
 * @param {string} feedbackData.subject - Subject of the feedback
 * @param {string} feedbackData.message - Detailed feedback message
 * @param {string} [feedbackData.email] - User email (optional)
 * @param {string} [feedbackData.userId] - User ID (optional)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const submitFeedback = async (feedbackData) => {
  try {
    // Validate required fields
    const { type, subject, message } = feedbackData;

    if (!type || !message) {
      return {
        success: false,
        error: 'Please fill in all required fields'
      };
    }

    // Validate field lengths (subject is optional)
    if (subject && subject.length > 100) {
      return {
        success: false,
        error: 'Subject must be less than 100 characters'
      };
    }

    if (message.length > 1000) {
      return {
        success: false,
        error: 'Message must be less than 1000 characters'
      };
    }

    // Validate email format if provided
    if (feedbackData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(feedbackData.email)) {
        return {
          success: false,
          error: 'Please enter a valid email address'
        };
      }
    }

    // Prepare feedback document
    const feedbackDocument = {
      type,
      subject,
      message,
      email: feedbackData.email || null,
      userId: feedbackData.userId || null,
      deviceInfo: {
        platform: 'unknown', // Could be enhanced with platform detection if needed
        appVersion: '1.0.0',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create feedback document in Firestore
    const result = await createDocument('feedback', feedbackDocument);
    
    if (result.error) {
      return {
        success: false,
        error: 'Failed to submit feedback. Please try again.'
      };
    }

    return {
      success: true,
      error: null
    };

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
};