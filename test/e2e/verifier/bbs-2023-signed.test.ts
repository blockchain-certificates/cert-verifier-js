import { describe, it, expect, beforeAll } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixture from '../../fixtures/v3/bbs-2023-signed-credential.json';

describe('bbs-2023 signed (base proof, not derived) document test suite', function () {
  let result;

  beforeAll(async function () {
    // This is intentional: bbs-2023 base proofs (produced by `sign`,
    // before going through `derive`) are not directly verifiable per the
    // vc-di-bbs spec's selective-disclosure design - they must be derived
    // first, even to disclose every field. See poc-vc-bbsplus AGENTS.md.
    const certificate = new Certificate(fixture as any);
    await certificate.init();
    result = await certificate.verify();
  });

  it('should fail verification', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('should expose the expected error message', function () {
    expect(result.message).toBe('The document\'s Bbs2023 signature could not be confirmed: The proof does not include a valid "proofValue" property.');
  });
});
