import { describe, it, expect } from 'vitest';
import { dateToUnixTimestamp, timestampToDateObject, validateDateTimeStamp } from '../../../src/helpers/date';

describe('dateToUnixTimestamp method', function () {
  describe('when given an empty string', function () {
    it('should return an empty string', function () {
      const emptyString = '';
      const result = dateToUnixTimestamp(emptyString);
      expect(result).toBe(0);
    });
  });

  describe('when given an iso date', function () {
    it('should return a valid timestamp', function () {
      const isoDate = '2018-06-18T22:37:22.325+00:00';
      const result = dateToUnixTimestamp(isoDate);
      expect(result).toEqual(new Date('2018-06-18T22:37:22.325Z').getTime());
    });
  });
});

describe('timestampToDateObject method', function () {
  it('should return a date object from a timestamp', function () {
    const fixtureTimestamp = 1518049414;
    const assertionDateObject = new Date(1518049414 * 1000);
    expect(timestampToDateObject(fixtureTimestamp)).toEqual(assertionDateObject);
  });
});

describe('validateDateTimestamp method', function () {
  describe('when the date is a valid ISO8601 timestamp', function () {
    describe('UTC', function () {
      it('should return true', function () {
        const fixture = '2018-06-18T22:37:22.325Z';
        const result = validateDateTimeStamp(fixture);
        expect(result).toBe(true);
      });
    });

    describe('UTC with no millisecond', function () {
      it('should return true', function () {
        const fixture = '2018-06-18T22:37:22Z';
        const result = validateDateTimeStamp(fixture);
        expect(result).toBe(true);
      });
    });

    describe('UTC no z', function () {
      it('should return false', function () {
        const fixture = '2018-06-18T22:37:22';
        const result = validateDateTimeStamp(fixture);
        expect(result).toBe(false);
      });
    });

    describe('UTC with timezone offset', function () {
      it('should return true', function () {
        const fixture = '2018-06-18T22:37:22.325+08:00';
        const result = validateDateTimeStamp(fixture);
        expect(result).toBe(true);
      });
    });

    describe('UTC with timezone offset no millisecond', function () {
      it('should return true', function () {
        const fixture = '2018-06-18T22:37:22+08:00';
        const result = validateDateTimeStamp(fixture);
        expect(result).toBe(true);
      });
    });
  });

  describe('when the date is an invalid ISO8601 timestamp', function () {
    describe('UTC no hour', function () {
      it('should return false', function () {
        const fixture = '2018-06-18';
        const result = validateDateTimeStamp(fixture);
        expect(result).toBe(false);
      });
    });

    describe('US ordering (YYYY-DD-MM)', function () {
      it('should return false', function () {
        const fixture = '2018-18-06T22:37:22.325Z';
        const result = validateDateTimeStamp(fixture);
        expect(result).toBe(false);
      });
    });

    describe('out of bounds month', function () {
      it('should return false', function () {
        const fixture = '2018-13-06T22:37:22.325Z';
        const result = validateDateTimeStamp(fixture);
        expect(result).toBe(false);
      });
    });

    describe('out of bounds day', function () {
      it('should return false', function () {
        const fixture = '2018-12-36T22:37:22.325Z';
        const result = validateDateTimeStamp(fixture);
        expect(result).toBe(false);
      });
    });

    describe('malformed', function () {
      it('should return true', function () {
        const fixture = '2018-06-1822:37:22+08:00';
        const result = validateDateTimeStamp(fixture);
        expect(result).toBe(false);
      });
    });
  });
});
