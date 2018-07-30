import 'babel-polyfill';
import { ensureNotExpired } from '../../../src/inspectors';

describe('Checks test suite', () => {
  describe('ensureNotExpired method', () => {
    const errorMessage = 'This certificate has expired.';

    describe('given it is called with no parameter', () => {
      it('should not throw an error', () => {
        expect(() => {
          ensureNotExpired();
        }).not.toThrow();
      });
    });

    describe('given it is called with a past date', () => {
      it('should throw an error', () => {
        const assertionDate = '2017-01-01';
        expect(() => {
          ensureNotExpired(assertionDate);
        }).toThrow(errorMessage);
      });
    });

    describe('given it is called with a future date', () => {
      it('should not throw an error ', () => {
        const fixtureDate = '2817-01-01';
        expect(() => {
          ensureNotExpired(fixtureDate);
        }).not.toThrow();
      });
    });
  });
});
