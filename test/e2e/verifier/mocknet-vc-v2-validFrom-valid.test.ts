import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import MocknetVCV2ValidFromValid from '../../fixtures/v3/mocknet-vc-v2-validFrom-valid.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('given the certificate is a valid mocknet (v3.0)', function () {
  // this test will expire in 2039
  it('should verify successfully', async function () {
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

    const certificate = new Certificate(MocknetVCV2ValidFromValid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    vi.restoreAllMocks();
  });
});
