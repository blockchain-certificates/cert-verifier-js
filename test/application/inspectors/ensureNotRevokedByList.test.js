import { ensureNotRevokedByList } from '../../../src/inspectors';
import revokedAssertionsFixture from '../../application/domain/verifier/useCases/fixtures/revokedAssertionsFixture';

describe('Inspectors test suite', function () {
  describe('ensureNotRevokedByList method', function () {
    describe('given it is called without revokedAssertions', function () {
      it('should return nothing', function () {
        expect(ensureNotRevokedByList()).toBe();
      });
    });

    describe('given a revocation assertion matches the assertion UID', () => {
      it('should throw an error with the revocation reason', () => {
        const assertionUidFixture = revokedAssertionsFixture.revokedAssertions[0].id;
        const revocationReasonAssertion = revokedAssertionsFixture.revokedAssertions[0].revocationReason;
        expect(() => {
          ensureNotRevokedByList(revokedAssertionsFixture.revokedAssertions, assertionUidFixture);
        }).toThrowError(`This certificate has been revoked by the issuer. Reason given: ${revocationReasonAssertion}.`);
      });
    });
  });
});
