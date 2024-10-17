import { describe, it, expect } from 'vitest';
import { ensureNotExpired } from '../../../src/inspectors';

describe('Inspectors test suite', function () {
  describe('ensureNotExpired method', function () {
    const errorMessage = 'This certificate has expired on Jan 1, 2017';

    describe('given it is called with no parameter', function () {
      it('should not throw an error', function () {
        expect(function () {
          ensureNotExpired();
        }).not.toThrow();
      });
    });

    describe('given it is called with a past date', function () {
      it('should throw an error', function () {
        const assertionDate = '2017-01-01';
        expect(function () {
          ensureNotExpired(assertionDate);
        }).toThrow(errorMessage);
      });
    });

    describe('given it is called with a future date', function () {
      it('should not throw an error ', function () {
        const fixtureDate = '2817-01-01';
        expect(function () {
          ensureNotExpired(fixtureDate);
        }).not.toThrow();
      });
    });
  });
});
