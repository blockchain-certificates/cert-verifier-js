import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../../src';
import fixture from '../../../fixtures/v3/testnet-v3-did--verification-method-mismatch.json';
import didDocument from '../../../fixtures/did/did:ion:EiAdjtCU7lOOND5xRgjpDiAB2DxAs9-QoFBAbcd3ttZsSA.json';
import fixtureIssuerProfile from '../../../fixtures/issuer-blockcerts.json';
import { universalResolverUrl } from '../../../../src/domain/did/valueObjects/didResolver';

describe('Blockcerts v3 beta signed with DID test suite', function () {
  describe('given the proof holds a verification method', function () {
    describe('and the verification method does not match the provided issuer profile DID', function () {
      it('should not verify successfully', async function () {
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
              remoteHash: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6',
              issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
              time: '2022-04-05T18:45:30.000Z',
              revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
            })
          };
        });

        const certificate = new Certificate(fixture);
        await certificate.init();
        const result = await certificate.verify();
        expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(result.message).toBe('Issuer identity mismatch - The identity document provided by the issuer does not match the verification method');
        vi.restoreAllMocks();
      });
    });
  });
});
