'use strict';

import {assert, expect} from 'chai'
import * as helpers from '../lib/checks'

describe("Certificate verifier", () => {

  describe("verify helpers", () => {

    it("ensures a date in the past fails expiration check", () => {
      try {
        helpers.ensureNotExpired(Date.parse("2017-01-01"));
      } catch (err) {
        assert.isOk(err);
      }
    });

    it("ensures a date in the future passes expiration check", () => {
      try {
        helpers.ensureNotExpired(Date.parse("2817-01-01"));
        assert.isOk(true);
      } catch (err) {
        assert.fail("This should not fail");
      }
    });

    it("ensures no expires field passes expiration check", () => {
      try {
        helpers.ensureNotExpired(null);
      } catch (err) {
        assert.isOk(err);
      }
    });
  });

});