import { Certificate, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate is a revoked testnet', function () {
  it('should fail', async function () {
    const certificate = new Certificate(FIXTURES.TestnetRevokedV2);
    const result = await certificate.verify(({ code, label, status, errorMessage }) => {
      if (code === SUB_STEPS.checkAuthenticity && status !== VERIFICATION_STATUSES.STARTING) {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(errorMessage).toBe('Transaction occurred at time when issuing address was not considered valid.');
      }
    });
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });
});
