import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import issuerBlockcertsV2a from '../../fixtures/issuer-blockcerts-v2a.json';
import TestnetTamperedHashes from '../../fixtures/v2/testnet-tampered-hashes-2.0.json';

describe('given the certificate is a testnet with tampered hashes', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/2.0-alpha/issuerTestnet.json') {
            return JSON.stringify(issuerBlockcertsV2a);
          }
        },
        lookForTx: () => ({
          remoteHash: '7570ad1a939b1d733668125df3e71ebbd593358e7d851eff3fdebd487462daab',
          issuingAddress: 'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
          time: '2017-05-03T17:06:19.000Z',
          revokedAddresses: [
            'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj'
          ]
        })
      };
    });
    certificate = new Certificate(TestnetTamperedHashes);
    await certificate.init();
    result = await certificate.verify();
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  it('should fail', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('should expose the error message', function () {
    expect(result.message).toBe('Computed hash does not match remote hash');
  });
});
