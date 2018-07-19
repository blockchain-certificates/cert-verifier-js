import { dateToUnixTimestamp } from '../../src/helpers/date';

describe('dateToUnixTimestamp method', () => {
  describe('when given an empty string', () => {
    it('should return an empty string', () => {
      const emptyString = '';
      const result = dateToUnixTimestamp(emptyString);
      expect(result).toBe(emptyString);
    });
  });

  describe('when given an iso date', () => {
    it('should return a valid date', () => {
      const isoDate = '2018-06-18T22:37:22.325+00:00';
      const result = dateToUnixTimestamp(isoDate);
      expect(result).toEqual(new Date('2018-06-18T22:37:22.325Z'));
    });
  });
});
