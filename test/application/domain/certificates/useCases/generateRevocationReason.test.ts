import domain from '../../../../../src/domain';
import { CREDENTIAL_STATUS_OPTIONS } from '../../../../../src/domain/certificates/useCases/generateRevocationReason';

describe('domain certificates generate revocation reason test suite', function () {
  describe('given it is called with a reason', function () {
    it('should return the revocation message with the reason', function () {
      const reasonFixture = 'This is a reason fixture.';
      const revocationReasonAssertion = `This certificate has been revoked by the issuer. Reason given: ${reasonFixture}`;
      const result = domain.certificates.generateRevocationReason(reasonFixture);
      expect(result).toBe(revocationReasonAssertion);
    });
  });

  describe('given it is called with a reason without a closing period', function () {
    it('should return the revocation message with the reason and a period', function () {
      const reasonFixture = 'This is a reason fixture';
      const revocationReasonAssertion = `This certificate has been revoked by the issuer. Reason given: ${reasonFixture}.`;
      const result = domain.certificates.generateRevocationReason(reasonFixture);
      expect(result).toBe(revocationReasonAssertion);
    });
  });

  describe('given it is called without a reason', function () {
    it('should return the revocation message without a reason', function () {
      const revocationReasonAssertion = 'This certificate has been revoked by the issuer.';
      const result = domain.certificates.generateRevocationReason();
      expect(result).toBe(revocationReasonAssertion);
    });
  });

  describe('given it is suspended', function () {
    it('should return the revocation message adapted for suspension', function () {
      const revocationReasonAssertion = 'This certificate has been suspended by the issuer.';
      const result = domain.certificates.generateRevocationReason('', CREDENTIAL_STATUS_OPTIONS.SUSPENDED);
      expect(result).toBe(revocationReasonAssertion);
    });
  });
});
