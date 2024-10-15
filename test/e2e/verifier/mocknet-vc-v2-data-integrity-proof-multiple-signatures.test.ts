import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import MocknetVCV2DataIntegrityProofMultipleSignatures from '../../fixtures/v3/mocknet-vc-v2-data-integrity-proof-multiple-signatures.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';
import fixtureCredentialSchema from '../../fixtures/credential-schema-example-id-card.json';

describe('given the certificate is signed with multiple chained DataIntegrityProof Merkle Proof 2019', function () {
  it('should be a valid verification', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureBlockcertsIssuerProfile);
          }

          if (url === 'https://www.blockcerts.org/samples/3.0/example-id-card-schema.json') {
            return JSON.stringify(fixtureCredentialSchema);
          }
        }
      };
    });
    const certificate = new Certificate(MocknetVCV2DataIntegrityProofMultipleSignatures as any); // TODO: fix typescript error with previous proof being string in BlockcertsV3 Model
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    vi.restoreAllMocks();
  });
});
