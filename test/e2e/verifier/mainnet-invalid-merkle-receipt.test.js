import { Certificate, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate is a mainnet with an invalid merkle receipt', function () {
  it('should fail', async function () {
    const certificate = new Certificate(FIXTURES.MainnetInvalidMerkleReceipt);
    const result = await certificate.verify(({ code, label, status, errorMessage }) => {
      if (code === SUB_STEPS.checkReceipt && status !== VERIFICATION_STATUSES.STARTING) {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(errorMessage).toBe('Invalid Merkle Receipt. Proof hash did not match Merkle root');
      }
    });
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });
});
