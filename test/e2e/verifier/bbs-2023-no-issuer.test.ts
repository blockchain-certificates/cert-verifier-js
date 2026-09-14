import { describe, it, expect } from 'vitest';
import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/bbs-2023-derived-credential-no-issuer.json';

describe('bbs-2023 derived document without an `issuer` property test suite', function () {
  it('should fail init with a helpful error message', async function () {
    // This fixture was derived with `/issuer` deliberately excluded from
    // the mandatory pointers (see poc-vc-bbsplus AGENTS.md): the BBS
    // selective-disclosure proof itself is cryptographically valid and
    // `proof.verificationMethod` still identifies the signer, but the
    // resulting document is not actually a spec-conformant Verifiable
    // Credential. Per the VC Data Model (both 1.1 and 2.0), a verifiable
    // credential MUST have an `issuer` property - the vc-di-bbs securing
    // mechanism doesn't protect this data-model-level constraint, so an
    // issuer that fails to mark `/issuer` mandatory at signing time can
    // produce derived "credentials" that no conformant verifier should
    // accept. This asserts that cert-verifier-js correctly rejects such a
    // document, rather than merely failing for its own convenience.
    const certificate = new Certificate(fixture as any);

    await expect(async () => {
      await certificate.init();
    }).rejects.toThrow('`issuer` must be a URL string or an object with an `id` URL string');
  });
});
