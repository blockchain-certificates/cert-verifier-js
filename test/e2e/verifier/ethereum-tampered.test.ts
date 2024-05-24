import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import EthereumTampered from '../../fixtures/v2/ethereum-tampered-2.0.json';

describe('given the certificate is a tampered ethereum', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://raw.githubusercontent.com/AnthonyRonning/https-github.com-labnol-files/master/issuer-eth.json?raw=true') {
            return JSON.stringify({
              '@context': [
                'https://w3id.org/openbadges/v2',
                'https://w3id.org/blockcerts/3.0'
              ],
              type: 'Profile',
              id: 'https://raw.githubusercontent.com/AnthonyRonning/https-github.com-labnol-files/master/issuer-eth.json?raw=true',
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
          remoteHash: '4f48e91f0397a49a5b56718a78d681c51932c8bd9242442b94bcfb93434957db',
          issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
          time: '2018-05-08T18:30:34.000Z',
          revokedAddresses: []
        })
      };
    });

    certificate = new Certificate(EthereumTampered);
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
