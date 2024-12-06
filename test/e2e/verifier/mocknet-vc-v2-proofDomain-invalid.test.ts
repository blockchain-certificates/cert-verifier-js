import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import MocknetVCV2ValidFromValid from '../../fixtures/v3/mocknet-vc-v2-validFrom-valid.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('given the proofPurpose of the certificate\'s proof does not match the verifier\'s purpose', function () {
  // this test will expire in 2039
  it('should fail verification', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureBlockcertsIssuerProfile);
          }
        }
      };
    });

    const fixture = {
      ...MocknetVCV2ValidFromValid,
      proof: {
        ...MocknetVCV2ValidFromValid.proof,
        domain: 'blockcerts.org'
      }
    };

    const certificate = new Certificate(fixture, { domain: ['example.org', 'another-example.org'] });
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    expect(result.message).toBe('The proof is not authorized for this domain');
    vi.restoreAllMocks();
  });
});
