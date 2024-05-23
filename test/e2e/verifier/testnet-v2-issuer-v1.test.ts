import { describe, it, expect, vi} from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import issuerBlockcertsV1 from '../../fixtures/issuer-blockcerts-v1.json';
import TestnetV2ValidV1Issuer from '../../fixtures/v2/testnet-valid-v1-issuer-2.0.json';

describe('given the certificate is a valid testnet (v2.0) issued by v1 issuer', function () {
  it('should verify successfully', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/mockissuer/issuer/issuerTestnet_v1.json') {
            return JSON.stringify(issuerBlockcertsV1);
          }
        },
        lookForTx: () => ({
          remoteHash: '4bc7314351723d1670ff49250aada05d6e5da31d0369a999f8e3cbc7fede5b74',
          issuingAddress: 'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
          time: '2017-05-03T18:29:43.000Z',
          revokedAddresses: [
            'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj'
          ]
        })
      };
    });
    const certificate = new Certificate(TestnetV2ValidV1Issuer);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    vi.restoreAllMocks();
  });
});
