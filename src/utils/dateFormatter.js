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
 * Get relative time: "in 2 days", "yesterday", "today"
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
  const diffMs = dateObj - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;

  return formatShortDate(dateObj);
}
