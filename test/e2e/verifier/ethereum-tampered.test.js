import { Certificate, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate is a tampered ethereum', function () {
  it('should fail', async function () {
    const certificate = new Certificate(FIXTURES.EthereumTampered);
    const result = await certificate.verify(({ code, label, status, errorMessage }) => {
      if (code === SUB_STEPS.compareHashes && status !== VERIFICATION_STATUSES.STARTING) {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(errorMessage).toBe('Computed hash does not match remote hash');
      }
    });
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });
});
