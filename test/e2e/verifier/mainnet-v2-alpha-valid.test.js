import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate is a valid mainnet (v2.0 alpha)', function () {
  it('should verify successfully', async function () {
    const certificate = new Certificate(FIXTURES.MainnetV2AlphaValid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
