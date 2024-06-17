import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixture from '../../fixtures/v3/ecdsa-sd-2023-derived-credential.json';
import fixtureIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('ecdsa-sd-2023 signed and derived document test suite', function () {
  it('should verify successfully', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureIssuerProfile);
          }
        }
      };
    });
    const certificate = new Certificate(fixture as any);
    await certificate.init();
    const result = await certificate.verify();

    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
