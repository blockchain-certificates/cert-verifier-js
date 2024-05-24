import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import EthereumRopstenV2Valid from '../../fixtures/v2/ethereum-ropsten-valid-2.0.json';

describe('given the certificate is a valid ethereum ropsten', function () {
  it('should verify successfully', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://raw.githubusercontent.com/AnthonyRonning/https-github.com-labnol-files/master/issuer-eth-case-sensitive.json?raw=true') {
            return JSON.stringify({
              '@context': [
                'https://w3id.org/openbadges/v2',
                'https://w3id.org/blockcerts/3.0'
              ],
              type: 'Profile',
              id: 'https://raw.githubusercontent.com/AnthonyRonning/https-github.com-labnol-files/master/issuer-eth-case-sensitive.json?raw=true',
              publicKey: [
                {
                  id: 'ecdsa-koblitz-pubkey:0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
                  created: '2018-01-01T21:10:10.615+00:00'
                }
              ]
            });
          }
        },
        lookForTx: () => ({
          remoteHash: '28b6d698afb0dd598954a7c7410f9ed722f7756850a97efe187ab0eab2a14831',
          issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
          time: '2018-05-30T03:14:05.000Z',
          revokedAddresses: []
        })
      };
    });
    const certificate = new Certificate(EthereumRopstenV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    vi.restoreAllMocks();
  });
});
