/**
 * Date Formatting Utilities
 * Provides consistent date/time formatting across the app
 */

/**
 * Format a date to user-friendly string: "Month DD, YYYY | H:MM AM/PM"
 *
 * @param {Date|string} date - Date object, ISO string, or formatted string
 * @returns {string} Formatted date string
 *
 * @example
 * formatDateTime(new Date('2025-12-15T16:00:00Z'))
 * // Returns: "December 15, 2025 | 4:00 PM"
 *
 * formatDateTime('2025-12-15T16:00:00.000Z')
 * // Returns: "December 15, 2025 | 4:00 PM"
 */
export function formatDateTime(date) {
  if (!date) return 'TBD';

  let dateObj;

  // Handle different input types
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // Check if already formatted (contains " | " separator)
    if (date.includes(' | ')) {
      return date; // Already in correct format
    }
    // Parse ISO string or other date string
    dateObj = new Date(date);
  } else {
    return 'Invalid date';
  }

  // Check if valid date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  // Format date: "December 15, 2025"
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);

  // Format time: "4:00 PM"
  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);

  return `${formattedDate} | ${formattedTime}`;
}

/**
 * Format date only (without time): "Month DD, YYYY"
 *
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'TBD';

  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Format time only: "H:MM AM/PM"
 *
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  if (!date) return 'TBD';

  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }

  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return dateObj.toLocaleTimeString('en-US', options);
}

/**
 * Format date for calendar events (short format): "Mon, Dec 15"
 *
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string
 */
export function formatShortDate(date) {
  if (!date) return 'TBD';

  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Check if a date is in the past
 *
 * @param {Date|string} date - Date object or ISO string
 * @returns {boolean} True if date is in the past
 */
export function isPastDate(date) {
  if (!date) return false;

  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return false;
  }

  return dateObj < new Date();
}

/**
 * Get relative time: "in 2 days", "yesterday", "today", "2 hours ago", "just now"
 *
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return '';

  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now - dateObj; // Changed to now - date for "ago" format
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  // Past times (most common for notifications)
  if (diffMs >= 0) {
    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else {
      const diffYears = Math.floor(diffMonths / 12);
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    }
  }

  // Future times (less common for notifications, but useful for tournaments)
  const futureDiffDays = Math.abs(Math.round(diffMs / (1000 * 60 * 60 * 24)));
  if (futureDiffDays === 0) return 'Today';
  if (futureDiffDays === 1) return 'Tomorrow';
  if (futureDiffDays < 7) return `In ${futureDiffDays} days`;

  return formatShortDate(dateObj);
}
