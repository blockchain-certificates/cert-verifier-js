import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixture from '../../fixtures/v3/ecdsa-sd-2023-derived-credential.json';

describe('ecdsa-sd-2023 signed and derived document test suite', function () {
  it('should verify successfully', async function () {
    const certificate = new Certificate(fixture as any);
    await certificate.init();
    const result = await certificate.verify();

    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
