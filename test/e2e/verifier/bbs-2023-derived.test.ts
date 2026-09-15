import { describe, it, expect } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixture from '../../fixtures/v3/bbs-2023-derived-credential.json';

describe('bbs-2023 signed and derived document test suite', function () {
  it('should verify successfully', async function () {
    const certificate = new Certificate(fixture as any);
    await certificate.init();
    const result = await certificate.verify();

    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });

  it('should expose the verified signer public key', async function () {
    const certificate = new Certificate(fixture as any);
    await certificate.init();
    await certificate.verify();

    expect(certificate.signers[0].issuerPublicKey).toBe(
      fixture.proof.verificationMethod.split('#')[1]
    );
  });
});
