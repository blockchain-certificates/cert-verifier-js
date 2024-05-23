import { describe, it, expect, vi } from 'vitest';
import { Certificate } from '../../../../src';
import fixture from '../../../fixtures/v3/testnet-v3-did--verification-method-not-referenced.json';
import didDocument from '../../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../../fixtures/issuer-profile.json';
import { universalResolverUrl } from '../../../../src/domain/did/valueObjects/didResolver';

describe('Blockcerts v3 beta signed with DID test suite', function () {
  describe('given the proof holds a verification method', function () {
    describe('and the verification method is not listed in the issuer\'s DID document', function () {
      it('should fail verification', async function () {
        vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
          const explorerLookup = await importOriginal();
          return {
            ...explorerLookup,
            request: async function ({ url }) {
              if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
                return JSON.stringify(fixtureIssuerProfile);
              }

              if (url === `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`) {
                return JSON.stringify({ didDocument });
              }
            },
            lookForTx: () => ({
              remoteHash: 'eca54e560dd43cccd900fa4bb9221f144d4c451c24beeddfd82e31db842bced1',
              issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
              time: '2022-02-03T14:08:54.000Z',
              revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
            })
          };
        });

        const certificate = new Certificate(fixture);
        await expect(async () => {
          await certificate.init();
        }).rejects.toThrow('Issuer identity mismatch - The identity document provided by the issuer does not reference the verification method');
        vi.restoreAllMocks();
      });
    });
  });
});
