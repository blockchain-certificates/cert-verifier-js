import { describe, it, expect, vi } from 'vitest';
import type { ExplorerAPI } from '@blockcerts/explorer-lookup';
import Certificate from '../../src/certificate';
import { universalResolverUrl } from '../../src/domain/did/valueObjects/didResolver';
import BlockcertsV3 from '../fixtures/v3/testnet-v3-did.json';
import fixtureIssuerProfile from '../fixtures/issuer-blockcerts.json';
import didDocument from '../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';

describe('explorerAPIs end to end test suite', function () {
  describe('given a custom explorer API with a parsingFunction is set', function () {
    describe('and the verification process occurs', function () {
      it.skip('should call the parsing function', async function () {
        // TODO: find correct implementation with vitest. It may be that this cannot work: https://github.com/vitest-dev/vitest/issues/3400
        const parsingFunctionSpy = vi.fn(() => ({
          remoteHash: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6',
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          time: '2022-04-05T18:45:30.000Z',
          revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
        }));
        const explorerAPI: ExplorerAPI = {
          serviceURL: {
            main: 'https://blockcerts.org/test',
            test: 'https://blockcerts.org/test'
          },
          priority: 0,
          parsingFunction: parsingFunctionSpy
        };

        vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
          const explorerLookup = await importOriginal();
          return {
            ...explorerLookup,
            // replace some exports
            request: async function ({ url }) {
              switch (url) {
                case 'https://blockcerts.org/test':
                case 'https://api.blockcypher.com/v1/btc/test3/txs/140ee9382a5c84433b9c89a5d9fea26c47415838b5841deb0c36a8a4b9121f2e?limit=500':
                case 'https://blockstream.info/testnet/api/tx/140ee9382a5c84433b9c89a5d9fea26c47415838b5841deb0c36a8a4b9121f2e':
                  return '{}';

                case `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`:
                  return JSON.stringify({ didDocument });

                case 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json':
                  return JSON.stringify(fixtureIssuerProfile);
              }
            }
          };
        });

        const instance = new Certificate(BlockcertsV3, { explorerAPIs: [explorerAPI] });
        await instance.init();
        await instance.verify();
        expect(parsingFunctionSpy).toHaveBeenCalled();
      });
    });
  });
});
