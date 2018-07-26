import domain from '../../../../../src/domain';

describe('domain certificates generate revocation reason test suite', () => {
  describe('given it is called with a reason', () => {
    it('should return the revocation message with the reason', () => {
      const reasonFixture = 'This is a reason fixture.';
      const revocationReasonAssertion = `This certificate has been revoked by the issuer. Reason given: ${reasonFixture}`;
      const result = domain.certificates.generateRevocationReason(reasonFixture);
      expect(result).toBe(revocationReasonAssertion);
    });
  });

  describe('given it is called with a reason without a closing period', () => {
    it('should return the revocation message with the reason and a period', () => {
      const reasonFixture = 'This is a reason fixture';
      const revocationReasonAssertion = `This certificate has been revoked by the issuer. Reason given: ${reasonFixture}.`;
      const result = domain.certificates.generateRevocationReason(reasonFixture);
      expect(result).toBe(revocationReasonAssertion);
    });
  });
});
