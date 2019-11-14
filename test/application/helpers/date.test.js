import { dateToUnixTimestamp, timestampToDateObject } from '../../../src/helpers/date';

describe('dateToUnixTimestamp method', function () {
  describe('when given an empty string', function () {
    it('should return an empty string', function () {
      const emptyString = '';
      const result = dateToUnixTimestamp(emptyString);
      expect(result).toBe(emptyString);
    });
  });

  describe('when given an iso date', function () {
    it('should return a valid date', function () {
      const isoDate = '2018-06-18T22:37:22.325+00:00';
      const result = dateToUnixTimestamp(isoDate);
      expect(result).toEqual(new Date('2018-06-18T22:37:22.325Z'));
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
