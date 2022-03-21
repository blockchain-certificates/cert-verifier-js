import parseRevocationKey from '../../../../../src/domain/verifier/useCases/parseRevocationKey';
import issuerProfileNoRevocationKeysFixture from './fixtures/issuerProfileV2JsonFixture';
import issuerProfileWithRevocationKeysFixture from './fixtures/issuerProfileWithRevocationKeysFixture.json';
import type { Issuer } from '../../../../../src/models/Issuer';

describe('Verifier domain parseRevocationKey use case test suite', function () {
  describe('given no issuer profile is passed', function () {
    it('should return an empty string', function () {
      const result = parseRevocationKey();
      expect(result).toBe('');
    });
  });

  describe('given an issuer profile is passed', function () {
    describe('given the issuer profile has no revocationKeys property', function () {
      it('should return an empty string', function () {
        const result = parseRevocationKey(issuerProfileNoRevocationKeysFixture);
        expect(result).toBe('');
      });
    });

    describe('given the issuer profile has at least one revocation key', function () {
      it('should return the revocation key', function () {
        const result = parseRevocationKey(issuerProfileWithRevocationKeysFixture as Issuer);
        const assertion = issuerProfileWithRevocationKeysFixture.revocationKeys[0].key;
        expect(result).toBe(assertion);
      });
    });

    describe('given the issuer profile has no revocation key', function () {
      it('should return an empty string', function () {
        issuerProfileWithRevocationKeysFixture.revocationKeys = [];
        const result = parseRevocationKey(issuerProfileWithRevocationKeysFixture as Issuer);
        expect(result).toBe('');
      });
    });
  });
});
