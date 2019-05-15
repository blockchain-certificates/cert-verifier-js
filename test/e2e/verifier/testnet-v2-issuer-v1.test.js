import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate is a valid testnet (v2.0) issued by v1 issuer', function () {
  it('should verify successfully', async function () {
    const certificate = new Certificate(FIXTURES.TestnetV2ValidV1Issuer);
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
