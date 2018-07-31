import { ensureNotRevoked } from '../../../src/inspectors';
import revokedAssertionsFixture from '../../application/domain/verifier/useCases/fixtures/revokedAssertionsFixture';

describe('Inspectors test suite', function () {
  describe('ensureNotRevoked method', function () {
    describe('given it is called without revokedAddresses', function () {
      it('should return nothing', function () {
        expect(ensureNotRevoked()).toBeUndefined();
      });
    });

    describe('given it is called without keys', function () {
      it('should return nothing', function () {
        expect(ensureNotRevoked(['something here'])).toBeUndefined();
      });
    });

    describe('given it is called with addresses and keys', function () {
      describe('given a revocation assertion matches the assertion UID', function () {
        describe('given keys is a type string', function () {
          it('should find the revocation match and throw an error', function () {
            const assertionUidFixture = revokedAssertionsFixture.revokedAssertions[0].id;
            const revocationReasonAssertion = revokedAssertionsFixture.revokedAssertions[0].revocationReason;
            expect(function () {
              ensureNotRevoked(revokedAssertionsFixture.revokedAssertions, assertionUidFixture);
            }).toThrowError(`This certificate has been revoked by the issuer. Reason given: ${revocationReasonAssertion}.`);
          });
        });

        describe('given keys is an array', function () {
          it('should throw an error with the revocation reason', function () {
            const assertionUidFixture = [revokedAssertionsFixture.revokedAssertions[0].id];
            const revocationReasonAssertion = revokedAssertionsFixture.revokedAssertions[0].revocationReason;
            expect(function () {
              ensureNotRevoked(revokedAssertionsFixture.revokedAssertions, assertionUidFixture);
            }).toThrowError(`This certificate has been revoked by the issuer. Reason given: ${revocationReasonAssertion}.`);
          });
        });
      });
    });
  });
});
