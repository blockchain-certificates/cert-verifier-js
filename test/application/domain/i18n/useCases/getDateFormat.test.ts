import { describe, it, expect } from 'vitest';
import domain from '../../../../../src/domain';

describe('domain i18n getDateFormat use case test suite', function () {
  describe('given a plain date string without timezone', function () {
    it('should format the date correctly', function () {
      // Using mid-month noon local time to avoid timezone boundary issues
      const result = domain.i18n.getDateFormat('2017-06-15T12:00:00');
      expect(result).toBe('Jun 15, 2017');
    });
  });

  describe('given a UTC date string with a Z suffix', function () {
    it('should strip the Z and format the date correctly', function () {
      // Noon UTC - safe across all timezones after Z is stripped to local time
      const result = domain.i18n.getDateFormat('2017-06-15T12:00:00Z');
      expect(result).toBe('Jun 15, 2017');
    });
  });

  describe('given a date string with a positive timezone offset', function () {
    it('should strip the offset and format the date correctly', function () {
      const result = domain.i18n.getDateFormat('2017-06-15T14:00:00+02:00');
      expect(result).toBe('Jun 15, 2017');
    });
  });
});
