import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import EcdsaSd2023Fixture from '../../fixtures/v3/ecdsa-sd-2023-derived-credential.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';

function getIssuerProfileResponse (): string {
  const issuerProfile = {
    ...fixtureBlockcertsIssuerProfile
  };

  delete issuerProfile.proof; // we are not testing this part and since we had the `expires` field, it would fail

  const targetVerificationMethod = issuerProfile.verificationMethod
    .find(vm => vm.id === EcdsaSd2023Fixture.proof.verificationMethod);

  targetVerificationMethod.revoked = '2023-04-05T18:45:30Z';

  return JSON.stringify(issuerProfile);
}

describe('given the certificate is signed by a revoked EcdsaSd2023 verification method', function () {
  it('should fail verification', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return getIssuerProfileResponse();
          }
        }
      };
    });

    const certificate = new Certificate(EcdsaSd2023Fixture);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    expect(result.message).toBe('The verification key has been revoked');
    vi.restoreAllMocks();
  });
});
