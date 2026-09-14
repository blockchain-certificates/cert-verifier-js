import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import Bbs2023Fixture from '../../fixtures/v3/bbs-2023-derived-credential.json';

vi.mock('../../../src/domain/did/useCases/resolveDidKeyDocument', async (importOriginal) => {
  const originalModule: any = await importOriginal();
  return {
    ...originalModule,
    default: async function (didKeyUri: string) {
      const didDocument = await originalModule.default(didKeyUri);
      const targetVerificationMethod = didDocument.verificationMethod
        .find(vm => vm.id === Bbs2023Fixture.proof.verificationMethod);
      targetVerificationMethod.revoked = '2023-04-05T18:45:30Z';
      return didDocument;
    }
  };
});

describe('given the certificate is signed by a revoked Bbs2023 verification method', function () {
  it('should fail verification', async function () {
    const certificate = new Certificate(Bbs2023Fixture as any);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    expect(result.message).toBe('The verification key has been revoked');
    vi.restoreAllMocks();
  });
});
