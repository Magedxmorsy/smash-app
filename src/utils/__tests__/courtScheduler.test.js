/**
 * Tests for courtScheduler utility functions
 */

import {
  scheduleMatches,
  getSchedulingSummary,
  calculateRoundDuration,
  parseCourts,
  groupMatchesByTimeSlot,
  needsScheduling,
  formatTimeSlot,
  validateCourts,
} from '../courtScheduler';

describe('scheduleMatches', () => {
  const baseStartTime = new Date('2025-12-15T10:00:00');

  const createMatch = (id) => ({
    id: `match${id}`,
    round: 1,
    leftTeam: { id: `team${id * 2 - 1}` },
    rightTeam: { id: `team${id * 2}` },
  });

  it('should return empty array when matches is null', () => {
    const result = scheduleMatches(null, ['Court 1'], baseStartTime);
    expect(result).toEqual([]);
  });

  it('should return empty array when matches is empty', () => {
    const result = scheduleMatches([], ['Court 1'], baseStartTime);
    expect(result).toEqual([]);
  });

  it('should throw error when courts is null', () => {
    const matches = [createMatch(1)];
    expect(() => scheduleMatches(matches, null, baseStartTime)).toThrow('At least one court is required');
  });

  it('should throw error when courts is empty array', () => {
    const matches = [createMatch(1)];
    expect(() => scheduleMatches(matches, [], baseStartTime)).toThrow('At least one court is required');
  });

  it('should schedule single match on single court', () => {
    const matches = [createMatch(1)];
    const courts = ['Court 1'];
    const result = scheduleMatches(matches, courts, baseStartTime);

    expect(result).toHaveLength(1);
    expect(result[0].court).toBe('Court 1');
    expect(result[0].timeSlot).toBe(1);
    expect(result[0].duration).toBe(60);
    expect(new Date(result[0].dateTime)).toEqual(baseStartTime);
  });

  it('should schedule multiple matches on single court sequentially', () => {
    const matches = [createMatch(1), createMatch(2), createMatch(3)];
    const courts = ['Court 1'];
    const result = scheduleMatches(matches, courts, baseStartTime);

    expect(result).toHaveLength(3);

    // First match at 10:00
    expect(result[0].court).toBe('Court 1');
    expect(result[0].timeSlot).toBe(1);
    expect(new Date(result[0].dateTime)).toEqual(baseStartTime);

    // Second match at 11:15 (60 min + 15 min buffer)
    expect(result[1].court).toBe('Court 1');
    expect(result[1].timeSlot).toBe(2);
    expect(new Date(result[1].dateTime)).toEqual(new Date('2025-12-15T11:15:00'));

    // Third match at 12:30 (2 * 75 min)
    expect(result[2].court).toBe('Court 1');
    expect(result[2].timeSlot).toBe(3);
    expect(new Date(result[2].dateTime)).toEqual(new Date('2025-12-15T12:30:00'));
  });

  it('should distribute matches across multiple courts in parallel', () => {
    const matches = [createMatch(1), createMatch(2), createMatch(3), createMatch(4)];
    const courts = ['Court 1', 'Court 2'];
    const result = scheduleMatches(matches, courts, baseStartTime);

    expect(result).toHaveLength(4);

    // First two matches at 10:00 on different courts
    expect(result[0].court).toBe('Court 1');
    expect(result[0].timeSlot).toBe(1);
    expect(new Date(result[0].dateTime)).toEqual(baseStartTime);

    expect(result[1].court).toBe('Court 2');
    expect(result[1].timeSlot).toBe(1);
    expect(new Date(result[1].dateTime)).toEqual(baseStartTime);

    // Next two matches at 11:15 on different courts
    expect(result[2].court).toBe('Court 1');
    expect(result[2].timeSlot).toBe(2);
    expect(new Date(result[2].dateTime)).toEqual(new Date('2025-12-15T11:15:00'));

    expect(result[3].court).toBe('Court 2');
    expect(result[3].timeSlot).toBe(2);
    expect(new Date(result[3].dateTime)).toEqual(new Date('2025-12-15T11:15:00'));
  });

  it('should handle custom match duration and buffer time', () => {
    const matches = [createMatch(1), createMatch(2)];
    const courts = ['Court 1'];
    const result = scheduleMatches(matches, courts, baseStartTime, 45, 10);

    expect(result).toHaveLength(2);

    // First match at 10:00
    expect(new Date(result[0].dateTime)).toEqual(baseStartTime);
    expect(result[0].duration).toBe(45);

    // Second match at 10:55 (45 min + 10 min buffer)
    expect(new Date(result[1].dateTime)).toEqual(new Date('2025-12-15T10:55:00'));
    expect(result[1].duration).toBe(45);
  });

  it('should preserve original match data', () => {
    const matches = [
      {
        id: 'match1',
        round: 1,
        leftTeam: { id: 'team1', name: 'Team A' },
        rightTeam: { id: 'team2', name: 'Team B' },
        customField: 'custom value',
      },
    ];
    const courts = ['Court 1'];
    const result = scheduleMatches(matches, courts, baseStartTime);

    expect(result[0].id).toBe('match1');
    expect(result[0].round).toBe(1);
    expect(result[0].leftTeam.name).toBe('Team A');
    expect(result[0].customField).toBe('custom value');
  });

  it('should round-robin through 3 courts correctly', () => {
    const matches = [
      createMatch(1),
      createMatch(2),
      createMatch(3),
      createMatch(4),
      createMatch(5),
      createMatch(6),
    ];
    const courts = ['Court 1', 'Court 2', 'Court 3'];
    const result = scheduleMatches(matches, courts, baseStartTime);

    // First time slot: Courts 1, 2, 3
    expect(result[0].court).toBe('Court 1');
    expect(result[0].timeSlot).toBe(1);
    expect(result[1].court).toBe('Court 2');
    expect(result[1].timeSlot).toBe(1);
    expect(result[2].court).toBe('Court 3');
    expect(result[2].timeSlot).toBe(1);

    // Second time slot: Courts 1, 2, 3
    expect(result[3].court).toBe('Court 1');
    expect(result[3].timeSlot).toBe(2);
    expect(result[4].court).toBe('Court 2');
    expect(result[4].timeSlot).toBe(2);
    expect(result[5].court).toBe('Court 3');
    expect(result[5].timeSlot).toBe(2);
  });
});

describe('getSchedulingSummary', () => {
  it('should calculate summary for single court', () => {
    const result = getSchedulingSummary(4, 1);

    expect(result.timeSlotsNeeded).toBe(4);
    expect(result.totalDurationMinutes).toBe(285); // 4 slots * 75 min - 15 buffer (last one)
    expect(result.totalDurationFormatted).toBe('4h 45m');
    expect(result.matchesPerSlot).toBe(1);
    expect(result.simultaneous).toBe(false);
  });

  it('should calculate summary for multiple courts', () => {
    const result = getSchedulingSummary(6, 2);

    expect(result.timeSlotsNeeded).toBe(3);
    expect(result.totalDurationMinutes).toBe(210); // 3 slots * 75 min - 15 buffer (last one)
    expect(result.totalDurationFormatted).toBe('3h 30m');
    expect(result.matchesPerSlot).toBe(2);
    expect(result.simultaneous).toBe(false);
  });

  it('should identify when all matches can be played simultaneously', () => {
    const result = getSchedulingSummary(2, 4);

    expect(result.timeSlotsNeeded).toBe(1);
    expect(result.totalDurationMinutes).toBe(60); // 1 slot * 75 min - 15 buffer = 60
    expect(result.simultaneous).toBe(true);
  });

  it('should handle custom duration and buffer', () => {
    const result = getSchedulingSummary(3, 1, 45, 10);

    expect(result.timeSlotsNeeded).toBe(3);
    expect(result.totalDurationMinutes).toBe(155); // 3 slots * 55 min - 10 buffer
    expect(result.totalDurationFormatted).toBe('2h 35m');
  });

  it('should handle exact division of matches by courts', () => {
    const result = getSchedulingSummary(8, 4);

    expect(result.timeSlotsNeeded).toBe(2);
    expect(result.totalDurationMinutes).toBe(135); // 2 slots * 75 min - 15 buffer
    expect(result.totalDurationFormatted).toBe('2h 15m');
  });

  it('should format minutes correctly when less than 10', () => {
    const result = getSchedulingSummary(1, 1, 65, 0);

    expect(result.totalDurationMinutes).toBe(65);
    expect(result.totalDurationFormatted).toBe('1h 5m');
  });
});

describe('calculateRoundDuration', () => {
  it('calculates duration when courts are sufficient', () => {
    // 4 matches, 4 courts = 1 time slot needed
    expect(calculateRoundDuration(4, 4, 30, 15)).toBe(45); // 1 slot × 45 min
  });

  it('calculates duration when courts are limited', () => {
    // 4 matches, 3 courts = 2 time slots needed (3 matches in slot 1, 1 match in slot 2)
    expect(calculateRoundDuration(4, 3, 30, 15)).toBe(90); // 2 slots × 45 min
  });

  it('calculates duration for extreme limitation', () => {
    // 6 matches, 1 court = 6 time slots needed (all matches sequential)
    expect(calculateRoundDuration(6, 1, 30, 15)).toBe(270); // 6 slots × 45 min
  });

  it('handles edge case with 1 match', () => {
    // 1 match, 3 courts = 1 time slot needed
    expect(calculateRoundDuration(1, 3, 30, 15)).toBe(45); // 1 slot × 45 min
  });

  it('handles edge case with more courts than matches', () => {
    // 2 matches, 5 courts = 1 time slot needed (all matches simultaneous)
    expect(calculateRoundDuration(2, 5, 30, 15)).toBe(45); // 1 slot × 45 min
  });

  it('calculates correctly with custom match duration and buffer', () => {
    // 3 matches, 2 courts, 20 min match, 10 min buffer
    // = 2 time slots (2 matches in slot 1, 1 match in slot 2)
    expect(calculateRoundDuration(3, 2, 20, 10)).toBe(60); // 2 slots × 30 min
  });
});

describe('parseCourts', () => {
  it('should return empty array for null input', () => {
    expect(parseCourts(null)).toEqual([]);
  });

  it('should return empty array for undefined input', () => {
    expect(parseCourts(undefined)).toEqual([]);
  });

  it('should return empty array for non-string input', () => {
    expect(parseCourts(123)).toEqual([]);
  });

  it('should return empty array for empty string', () => {
    expect(parseCourts('')).toEqual([]);
  });

  it('should parse comma-separated numbers', () => {
    const result = parseCourts('1,2,3');
    expect(result).toEqual(['Court 1', 'Court 2', 'Court 3']);
  });

  it('should parse comma-separated numbers with spaces', () => {
    const result = parseCourts('1, 2, 3');
    expect(result).toEqual(['Court 1', 'Court 2', 'Court 3']);
  });

  it('should parse named courts', () => {
    const result = parseCourts('Court A, Court B, Court C');
    expect(result).toEqual(['Court A', 'Court B', 'Court C']);
  });

  it('should handle range format', () => {
    const result = parseCourts('1-4');
    expect(result).toEqual(['Court 1', 'Court 2', 'Court 3', 'Court 4']);
  });

  it('should handle range format with spaces', () => {
    const result = parseCourts('1 - 4');
    expect(result).toEqual(['Court 1', 'Court 2', 'Court 3', 'Court 4']);
  });

  it('should handle single court number', () => {
    const result = parseCourts('1');
    expect(result).toEqual(['Court 1']);
  });

  it('should handle single named court', () => {
    const result = parseCourts('Court A');
    expect(result).toEqual(['Court A']);
  });

  it('should preserve custom court names without "Court" prefix', () => {
    const result = parseCourts('Stadium A, Arena B, Field C');
    expect(result).toEqual(['Stadium A', 'Arena B', 'Field C']);
  });

  it('should handle mixed formats', () => {
    const result = parseCourts('Court 1, Court 2');
    expect(result).toEqual(['Court 1', 'Court 2']);
  });

  it('should trim whitespace from court names', () => {
    const result = parseCourts('  Court A  ,  Court B  ');
    expect(result).toEqual(['Court A', 'Court B']);
  });

  it('should filter out empty parts', () => {
    const result = parseCourts('1,,2,,3');
    expect(result).toEqual(['Court 1', 'Court 2', 'Court 3']);
  });

  it('should handle lowercase "court" in names', () => {
    const result = parseCourts('court 1, court 2');
    expect(result).toEqual(['court 1', 'court 2']);
  });

  it('should handle range of 1', () => {
    const result = parseCourts('5-5');
    expect(result).toEqual(['Court 5']);
  });
});

describe('groupMatchesByTimeSlot', () => {
  it('should group matches by time slot', () => {
    const matches = [
      { id: 'match1', timeSlot: 1 },
      { id: 'match2', timeSlot: 1 },
      { id: 'match3', timeSlot: 2 },
      { id: 'match4', timeSlot: 2 },
    ];

    const result = groupMatchesByTimeSlot(matches);

    expect(result[1]).toHaveLength(2);
    expect(result[1][0].id).toBe('match1');
    expect(result[1][1].id).toBe('match2');
    expect(result[2]).toHaveLength(2);
    expect(result[2][0].id).toBe('match3');
    expect(result[2][1].id).toBe('match4');
  });

  it('should handle matches without timeSlot (defaults to 1)', () => {
    const matches = [{ id: 'match1' }, { id: 'match2' }];

    const result = groupMatchesByTimeSlot(matches);

    expect(result[1]).toHaveLength(2);
  });

  it('should handle empty array', () => {
    const result = groupMatchesByTimeSlot([]);
    expect(result).toEqual({});
  });

  it('should handle single match', () => {
    const matches = [{ id: 'match1', timeSlot: 3 }];

    const result = groupMatchesByTimeSlot(matches);

    expect(result[3]).toHaveLength(1);
    expect(result[3][0].id).toBe('match1');
  });

  it('should preserve match data', () => {
    const matches = [
      { id: 'match1', timeSlot: 1, court: 'Court 1', customData: 'test' },
    ];

    const result = groupMatchesByTimeSlot(matches);

    expect(result[1][0].court).toBe('Court 1');
    expect(result[1][0].customData).toBe('test');
  });
});

describe('needsScheduling', () => {
  it('should return false when courts equal matches', () => {
    expect(needsScheduling(3, 3)).toBe(false);
  });

  it('should return false when courts exceed matches', () => {
    expect(needsScheduling(2, 5)).toBe(false);
  });

  it('should return true when matches exceed courts', () => {
    expect(needsScheduling(5, 2)).toBe(true);
  });

  it('should return false for 0 matches', () => {
    expect(needsScheduling(0, 1)).toBe(false);
  });

  it('should return true when 1 court and multiple matches', () => {
    expect(needsScheduling(3, 1)).toBe(true);
  });
});

describe('formatTimeSlot', () => {
  it('should format time slot correctly', () => {
    const startTime = new Date('2025-12-15T10:00:00');
    const result = formatTimeSlot(startTime, 60);

    expect(result).toBe('10:00 AM - 11:00 AM');
  });

  it('should handle afternoon times', () => {
    const startTime = new Date('2025-12-15T14:30:00');
    const result = formatTimeSlot(startTime, 60);

    expect(result).toBe('2:30 PM - 3:30 PM');
  });

  it('should handle custom duration', () => {
    const startTime = new Date('2025-12-15T09:00:00');
    const result = formatTimeSlot(startTime, 45);

    expect(result).toBe('9:00 AM - 9:45 AM');
  });

  it('should handle midnight', () => {
    const startTime = new Date('2025-12-15T00:00:00');
    const result = formatTimeSlot(startTime, 60);

    expect(result).toBe('12:00 AM - 1:00 AM');
  });

  it('should handle time crossing noon', () => {
    const startTime = new Date('2025-12-15T11:30:00');
    const result = formatTimeSlot(startTime, 60);

    expect(result).toBe('11:30 AM - 12:30 PM');
  });

  it('should return empty string for null', () => {
    expect(formatTimeSlot(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(formatTimeSlot(undefined)).toBe('');
  });

  it('should use default 60 minute duration', () => {
    const startTime = new Date('2025-12-15T10:00:00');
    const result = formatTimeSlot(startTime);

    expect(result).toBe('10:00 AM - 11:00 AM');
  });
});

describe('validateCourts', () => {
  it('should return invalid for empty courts array', () => {
    const result = validateCourts([], 8);

    expect(result.valid).toBe(false);
    expect(result.message).toBe('At least one court is required');
  });

  it('should indicate simultaneous play when enough courts', () => {
    const courts = ['Court 1', 'Court 2', 'Court 3', 'Court 4'];
    const result = validateCourts(courts, 8); // 8 teams = 4 first-round matches

    expect(result.valid).toBe(true);
    expect(result.simultaneous).toBe(true);
    expect(result.message).toBe('All matches can be played simultaneously');
  });

  it('should calculate time slots when courts are limited', () => {
    const courts = ['Court 1', 'Court 2'];
    const result = validateCourts(courts, 8); // 8 teams = 4 matches, need 2 time slots

    expect(result.valid).toBe(true);
    expect(result.simultaneous).toBe(false);
    expect(result.timeSlotsNeeded).toBe(2);
    expect(result.message).toContain('2 time slots');
  });

  it('should handle single court', () => {
    const courts = ['Court 1'];
    const result = validateCourts(courts, 4); // 4 teams = 2 matches

    expect(result.valid).toBe(true);
    expect(result.simultaneous).toBe(false);
    expect(result.timeSlotsNeeded).toBe(2);
  });

  it('should handle odd number of teams', () => {
    const courts = ['Court 1', 'Court 2'];
    const result = validateCourts(courts, 6); // 6 teams = 3 matches

    expect(result.valid).toBe(true);
    expect(result.timeSlotsNeeded).toBe(2); // ceil(3/2)
  });

  it('should include duration in message', () => {
    const courts = ['Court 1'];
    const result = validateCourts(courts, 4);

    expect(result.duration).toBeDefined();
    expect(result.message).toContain(result.duration);
  });
});
