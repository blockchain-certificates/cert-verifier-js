import { ensureNotRevoked } from '../../../src/inspectors';
import revokedAssertionsFixture from '../../application/domain/verifier/useCases/fixtures/revokedAssertionsFixture';

describe('Inspectors test suite', function () {
  describe('ensureNotRevoked method', function () {
    describe('given it is called without revokedAddresses', function () {
      it('should return nothing', function () {
        expect(ensureNotRevoked()).toBe();
      });
    });

    describe('given it is called without keys', function () {
      it('should return nothing', function () {
        expect(ensureNotRevoked(['something here'])).toBe();
      });
    });

    describe('given it is called with addresses and keys', () => {
      describe('given a revocation assertion matches the assertion UID', () => {
        describe('given keys is a type string', () => {
          it('should find the revocation match and throw an error', () => {
            const assertionUidFixture = revokedAssertionsFixture.revokedAssertions[0].id;
            const revocationReasonAssertion = revokedAssertionsFixture.revokedAssertions[0].revocationReason;
            expect(() => {
              ensureNotRevoked(revokedAssertionsFixture.revokedAssertions, assertionUidFixture);
            }).toThrowError(`This certificate has been revoked by the issuer. Reason given: ${revocationReasonAssertion}.`);
          });
        });

        describe('given keys is an array', () => {
          it('should throw an error with the revocation reason', () => {
            const assertionUidFixture = [revokedAssertionsFixture.revokedAssertions[0].id];
            const revocationReasonAssertion = revokedAssertionsFixture.revokedAssertions[0].revocationReason;
            expect(() => {
              ensureNotRevoked(revokedAssertionsFixture.revokedAssertions, assertionUidFixture);
            }).toThrowError(`This certificate has been revoked by the issuer. Reason given: ${revocationReasonAssertion}.`);
          });
        });
      });
    });
  });
});
