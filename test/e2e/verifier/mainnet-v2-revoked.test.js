import { Certificate, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate is a revoked mainnet', function () {
  it('should fail', async function () {
    const certificate = new Certificate(FIXTURES.MainnetV2Revoked);
    const result = await certificate.verify(({ code, label, status, errorMessage }) => {
      if (code === SUB_STEPS.checkRevokedStatus && status !== VERIFICATION_STATUSES.STARTING) {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(errorMessage).toBe('This certificate has been revoked by the issuer. Reason given: Issued in error.');
      }
    });
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });
});
