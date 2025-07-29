import { describe, it, expect } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixture from '../../fixtures/v3/vp-eddsa-rdfc-2022.json';

describe('EddsaRDFC2022 Verifier Test Suite', function () {
  it('should verify a signed credential with EddsaRDFC2022', async function () {
    const certificate = new Certificate(fixture as any, { proofPurpose: 'authentication', challenge: fixture.proof.challenge });
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
