import { describe, it, expect, vi } from 'vitest';
import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/testnet-v3-verification-method-issuer-profile.json';
import fixtureIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('Proof verification method is bound to issuer profile test suite', function () {
  it('should verify', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureIssuerProfile);
          }
        }
      };
    });
    const certificate = new Certificate(fixture);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.message)
      .toEqual({
        label: 'Verified',
        description: 'The EcdsaSecp256k1Signature2019 signature of this document has been successfully verified.'
      });
    vi.restoreAllMocks();
  });
});
