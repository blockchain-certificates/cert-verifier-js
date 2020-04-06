import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate is a valid mocknet (v2.0)', function () {
  it('should verify successfully', async function () {
    const certificate = new Certificate(FIXTURES.MocknetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
