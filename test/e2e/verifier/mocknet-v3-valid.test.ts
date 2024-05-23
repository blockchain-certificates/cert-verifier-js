import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import secp256k1IssuerProfile from '../../assertions/hyland-issuer-profile-secp256k1.json';
import merkleProofMocknetIssuerProfile from '../../assertions/hyland-issuer-profile-mocknet-merkleproof2019.json';
import MocknetV3Valid from '../../fixtures/v3/mocknet-v3-valid.json';

describe('given the certificate is a valid mocknet (v3.0)', function () {
  it('should verify successfully', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://issuer.dev.hylandcredentials.com/93d02af5-8683-452a-a79c-959deae72495/issuer_profile.json') {
            return JSON.stringify(secp256k1IssuerProfile);
          }

          if (url === 'https://issuer.dev.hylandcredentials.com/61e6c3fc-5779-4a6d-b05f-fdd10fdac5f0/issuer_profile.json') {
            return JSON.stringify(merkleProofMocknetIssuerProfile);
          }

          if (url === 'https://test.hyland.com/revocation?assertionId=urn%3Auuid%3Ae3351aa6-61e2-4d13-bd96-e848aa0c75cd') {
            return JSON.stringify({
              '@context': 'https://w3id.org/openbadges/v2',
              id: 'https://issuerprofile.hyland.com/revocations',
              type: 'RevocationList',
              issuer: 'https://issuer.dev.hylandcredentials.com/61e6c3fc-5779-4a6d-b05f-fdd10fdac5f0/issuer_profile.json',
              revokedAssertions: []
            })
          }
        }
      };
    });

    const certificate = new Certificate(MocknetV3Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);

    vi.restoreAllMocks();
  });
});
