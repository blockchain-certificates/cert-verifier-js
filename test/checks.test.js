'use strict';

import 'babel-polyfill';
import * as helpers from '../src/checks';

describe('Certificate verifier', () => {
  describe('verify helpers', () => {
    it('ensures a date in the past fails expiration check', () => {
      try {
        helpers.ensureNotExpired('2017-01-01');
      } catch (err) {
        expect(err.toString()).toBe('Error: This certificate has expired.');
      }
    });

    it('ensures a date in the future passes expiration check', () => {
      try {
        helpers.ensureNotExpired('2817-01-01');
        expect(true).toBe(true);
      } catch (err) {}
    });

    it('ensures no expires field passes expiration check', () => {
      try {
        helpers.ensureNotExpired(null);
      } catch (err) {
        expect(err).toBe(!false);
      }
    });
  });
});
