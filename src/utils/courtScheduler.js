/**
 * Court Scheduling Utilities
 * Handles match scheduling when courts are limited
 */

/**
 * Schedule matches across available courts with time slots
 *
 * @param {Array} matches - Array of match objects
 * @param {Array} courts - Array of court names/numbers (e.g., ['Court 1', 'Court 2'])
 * @param {Date} startTime - Tournament start time
 * @param {number} matchDuration - Match duration in minutes (default: 60)
 * @param {number} bufferTime - Time between matches in minutes (default: 15)
 * @returns {Array} Matches with assigned court and time
 *
 * @example
 * const matches = [match1, match2, match3, match4];
 * const courts = ['Court 1', 'Court 2'];
 * const startTime = new Date('2025-12-15T10:00:00');
 * const scheduled = scheduleMatches(matches, courts, startTime);
 * // Returns matches with court and dateTime assigned
 */
export function scheduleMatches(
  matches,
  courts,
  startTime,
  matchDuration = 60,
  bufferTime = 15
) {
  if (!matches || matches.length === 0) {
    return [];
  }

  if (!courts || courts.length === 0) {
    throw new Error('At least one court is required');
  }

  const scheduledMatches = [];
  const totalSlotDuration = matchDuration + bufferTime; // Minutes per slot
  let currentTimeSlot = 0;
  let courtIndex = 0;

  matches.forEach((match, index) => {
    // Assign court (round-robin through available courts)
    const assignedCourt = courts[courtIndex];

    // Calculate time slot
    // When we've used all courts, move to next time slot
    if (index > 0 && index % courts.length === 0) {
      currentTimeSlot++;
    }

    // Calculate match start time
    const minutesOffset = currentTimeSlot * totalSlotDuration;
    const matchStartTime = new Date(startTime.getTime() + minutesOffset * 60000);

    // Create scheduled match
    const scheduledMatch = {
      ...match,
      court: assignedCourt,
      dateTime: matchStartTime.toISOString(), // Convert to ISO string for Firestore
      timeSlot: currentTimeSlot + 1,
      duration: matchDuration,
    };

    scheduledMatches.push(scheduledMatch);

    // Move to next court
    courtIndex = (courtIndex + 1) % courts.length;
  });

  return scheduledMatches;
}

/**
 * Get scheduling summary for display
 *
 * @param {number} totalMatches - Number of matches to schedule
 * @param {number} availableCourts - Number of courts available
 * @param {number} matchDuration - Match duration in minutes
 * @param {number} bufferTime - Buffer time in minutes
 * @returns {Object} Scheduling information
 */
export function getSchedulingSummary(
  totalMatches,
  availableCourts,
  matchDuration = 60,
  bufferTime = 15
) {
  const timeSlotsNeeded = Math.ceil(totalMatches / availableCourts);
  const totalSlotDuration = matchDuration + bufferTime;
  const totalDurationMinutes = timeSlotsNeeded * totalSlotDuration - bufferTime; // Last match doesn't need buffer
  const totalDurationHours = Math.floor(totalDurationMinutes / 60);
  const remainingMinutes = totalDurationMinutes % 60;

  return {
    timeSlotsNeeded,
    totalDurationMinutes,
    totalDurationFormatted: `${totalDurationHours}h ${remainingMinutes}m`,
    matchesPerSlot: availableCourts,
    simultaneous: availableCourts >= totalMatches,
  };
}

/**
 * Calculate the total duration of a round based on number of matches and courts
 * This prevents court conflicts by accounting for matches that must wait for courts
 *
 * @param {number} matchCount - Number of matches in the round
 * @param {number} courtCount - Number of available courts
 * @param {number} matchDuration - Duration of each match in minutes (default: 30)
 * @param {number} bufferTime - Buffer time between matches in minutes (default: 15)
 * @returns {number} Total duration in minutes
 *
 * @example
 * // 4 matches, 3 courts: needs 2 time slots
 * calculateRoundDuration(4, 3, 30, 15) // 90 minutes (2 slots × 45 min)
 *
 * // 4 matches, 4 courts: needs 1 time slot
 * calculateRoundDuration(4, 4, 30, 15) // 45 minutes (1 slot × 45 min)
 */
export function calculateRoundDuration(matchCount, courtCount, matchDuration = 30, bufferTime = 15) {
  const timeSlotsNeeded = Math.ceil(matchCount / courtCount);
  return timeSlotsNeeded * (matchDuration + bufferTime);
}

/**
 * Parse courts from user input
 * Supports formats: "1,2,3" or "Court 1, Court 2" or "1-4"
 *
 * @param {string} courtsInput - User input for courts
 * @returns {Array} Array of court names
 *
 * @example
 * parseCourts("1,2,3") // ["Court 1", "Court 2", "Court 3"]
 * parseCourts("Court A, Court B") // ["Court A", "Court B"]
 * parseCourts("1-4") // ["Court 1", "Court 2", "Court 3", "Court 4"]
 */
export function parseCourts(courtsInput) {
  if (!courtsInput || typeof courtsInput !== 'string') {
    return [];
  }

  const input = courtsInput.trim();

  // Check for range format: "1-4"
  const rangeMatch = input.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = parseInt(rangeMatch[2]);
    const courts = [];
    for (let i = start; i <= end; i++) {
      courts.push(`Court ${i}`);
    }
    return courts;
  }

  // Split by comma
  const parts = input.split(',').map(part => part.trim()).filter(part => part.length > 0);

  // Convert to court names
  return parts.map(part => {
    // If it's just a number, prefix with "Court"
    if (/^\d+$/.test(part)) {
      return `Court ${part}`;
    }
    // If it already has "Court" in it, use as-is
    if (part.toLowerCase().includes('court')) {
      return part;
    }
    // Otherwise, just return the name
    return part;
  });
}

/**
 * Group matches by time slot for display
 *
 * @param {Array} scheduledMatches - Matches with dateTime and court assigned
 * @returns {Object} Matches grouped by time slot
 *
 * @example
 * const grouped = groupMatchesByTimeSlot(matches);
 * // { 1: [match1, match2], 2: [match3, match4] }
 */
export function groupMatchesByTimeSlot(scheduledMatches) {
  const grouped = {};

  scheduledMatches.forEach(match => {
    const slot = match.timeSlot || 1;
    if (!grouped[slot]) {
      grouped[slot] = [];
    }
    grouped[slot].push(match);
  });

  return grouped;
}

/**
 * Check if court scheduling is needed (more matches than courts)
 *
 * @param {number} matchCount - Number of matches
 * @param {number} courtCount - Number of courts
 * @returns {boolean} True if scheduling is needed
 */
export function needsScheduling(matchCount, courtCount) {
  return matchCount > courtCount;
}

/**
 * Format time slot label for display
 *
 * @param {Date} startTime - Match start time
 * @param {number} duration - Match duration in minutes
 * @returns {string} Formatted time range
 *
 * @example
 * formatTimeSlot(new Date('2025-12-15T10:00'), 60)
 * // "10:00 AM - 11:00 AM"
 */
export function formatTimeSlot(startTime, duration = 60) {
  if (!startTime) return '';

  const endTime = new Date(startTime.getTime() + duration * 60000);

  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  const start = startTime.toLocaleTimeString('en-US', options);
  const end = endTime.toLocaleTimeString('en-US', options);

  return `${start} - ${end}`;
}

/**
 * Validate court availability
 *
 * @param {Array} courts - Array of court names
 * @param {number} teamCount - Number of teams
 * @returns {Object} Validation result
 */
export function validateCourts(courts, teamCount) {
  const matchCount = Math.floor(teamCount / 2); // First round matches

  if (courts.length === 0) {
    return {
      valid: false,
      message: 'At least one court is required',
    };
  }

  if (courts.length >= matchCount) {
    return {
      valid: true,
      message: 'All matches can be played simultaneously',
      simultaneous: true,
    };
  }

  const summary = getSchedulingSummary(matchCount, courts.length);
  return {
    valid: true,
    message: `Matches will be played in ${summary.timeSlotsNeeded} time slots over ${summary.totalDurationFormatted}`,
    simultaneous: false,
    timeSlotsNeeded: summary.timeSlotsNeeded,
    duration: summary.totalDurationFormatted,
  };
}
