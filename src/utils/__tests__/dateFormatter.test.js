import { formatDateTime } from '../dateFormatter';

describe('dateFormatter', () => {
  describe('formatDateTime', () => {
    it('should return "TBD" for null or undefined', () => {
      expect(formatDateTime(null)).toBe('TBD');
      expect(formatDateTime(undefined)).toBe('TBD');
    });

    it('should format Date object correctly', () => {
      const date = new Date('2025-12-15T16:00:00Z');
      const result = formatDateTime(date);

      expect(result).toContain('December 15, 2025');
      expect(result).toContain('|');
    });

    it('should format ISO string correctly', () => {
      const isoString = '2025-12-15T16:00:00.000Z';
      const result = formatDateTime(isoString);

      expect(result).toContain('December 15, 2025');
      expect(result).toContain('|');
    });

    it('should return already formatted string unchanged', () => {
      const formatted = 'December 15, 2025 | 4:00 PM';
      expect(formatDateTime(formatted)).toBe(formatted);
    });

    it('should return "Invalid date" for invalid input', () => {
      expect(formatDateTime('not a date')).toBe('Invalid date');
      expect(formatDateTime({})).toBe('Invalid date');
    });
  });
});
