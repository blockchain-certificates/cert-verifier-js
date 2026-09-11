import { describe, it, expect, beforeAll } from 'vitest';
import { Certificate } from '../../src';
import fixture from '../fixtures/v3/bbs-2023-derived-credential.json';

describe('Certificate API Contract test suite', function () {
  describe('signers property', function () {
    describe('given the document is signed with a bbs-2023 Data Integrity proof', function () {
      let instance;

      beforeAll(async function () {
        instance = new Certificate(fixture as any);
        await instance.init();
        await instance.verify();
      });

      it('should expose an undefined signingDate, as bbs-2023 proofs intentionally omit `created`', function () {
        // Unlike every other supported suite, bbs-2023-cryptosuite never
        // sets `proof.created` (to avoid a timestamp that would correlate
        // all derived proofs), so there is no signing date to expose here.
        // This is the expected, spec-sanctioned behavior for this suite -
        // see poc-vc-bbsplus AGENTS.md for the issuer-side implications.
        expect(instance.signers[0].signingDate).toBeUndefined();
      });

      it('should expose the signatureSuiteType', function () {
        expect(instance.signers[0].signatureSuiteType).toBe('Bbs2023');
      });

      it('should expose the issuerPublicKey', function () {
        expect(instance.signers[0].issuerPublicKey).toBe(
          fixture.proof.verificationMethod.split('#')[1]
        );
      });
    });
  });
});
