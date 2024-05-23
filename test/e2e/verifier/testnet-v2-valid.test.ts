import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import TestnetV2Valid from '../../fixtures/v2/testnet-valid-2.0.json';
import issuerBlockcertsV2a from '../../fixtures/issuer-blockcerts-v2a.json';

describe('given the certificate is a valid testnet (v2.0)', function () {
  it('should verify successfully', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/2.0/issuer-testnet.json') {
            return JSON.stringify(issuerBlockcertsV2a);
          }
        },
        lookForTx: () => ({
          remoteHash: 'f029b45bb1a7b1f0b970f6de35344b73cccd16177b4c037acbc2541c7fc27078',
          issuingAddress: 'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
          time: '2017-06-29T22:10:29.000Z',
          revokedAddresses: [
            'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj'
          ]
        })
      };
    });
    const certificate = new Certificate(TestnetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    vi.restoreAllMocks();
  });
});
