import parseRevocationKey from '../../../../../src/domain/verifier/useCases/parseRevocationKey';
import issuerProfileNoRevocationKeysFixture from './fixtures/issuerProfileV2JsonFixture';
import issuerProfileWithRevocationKeysFixture from './fixtures/issuerProfileWithRevocationKeysFixture';

describe('Verifier domain parseRevocationKey use case test suite', () => {
  describe('given no issuer profile is passed', () => {
    it('should return null', () => {
      const result = parseRevocationKey();
      expect(result).toBe(null);
    });
  });

  describe('given an issuer profile is passed', () => {
    describe('given the issuer profile has no revocationKeys property', () => {
      it('should return null', () => {
        const result = parseRevocationKey(issuerProfileNoRevocationKeysFixture);
        expect(result).toBe(null);
      });
    });

    describe('given the issuer profile has at least one revocation key', () => {
      it('should return the revocation key', () => {
        const result = parseRevocationKey(issuerProfileWithRevocationKeysFixture);
        const assertion = issuerProfileWithRevocationKeysFixture.revocationKeys[0].key;
        expect(result).toBe(assertion);
      });
    });
  });
});
