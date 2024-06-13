import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixture from '../../fixtures/v3/ecdsa-sd-2023-signed-credential.json';
import fixtureIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('ecdsa-sd-2023 signed and derived document test suite', function () {
  let result;

  beforeAll(async function () {
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
    result = await certificate.verify();
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  it('should fail verification', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('should expose the expected error message', function () {
    expect(result.message).toBe('The document\'s EcdsaSd2023 signature could not be confirmed: "proof.proofValue" must be a derived proof.');
  });
});
