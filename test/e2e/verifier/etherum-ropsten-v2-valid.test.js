import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate is a valid ethereum ropsten', function () {
  it('should verify successfully', async function () {
    const certificate = new Certificate(FIXTURES.EthereumRopstenV2Valid);
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
