import { describe, it, expect, vi } from 'vitest';
import { Certificate } from '../../../../src';
import fixture from '../../../fixtures/v3/testnet-v3-did.json';
import didDocument from '../../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../../fixtures/issuer-blockcerts.json';
import { universalResolverUrl } from '../../../../src/domain/did/valueObjects/didResolver';

describe('Blockcerts v3 beta signed with DID test suite', function () {
  describe('given the proof holds a verification method', function () {
    describe('and the verification method refers to a DID', function () {
      it('should resolve the DID document', async function () {
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
        // expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
        expect(result.message).toEqual({ description: 'This is a valid ${chain} certificate.', label: 'Verified', linkText: 'View transaction link' });
        vi.restoreAllMocks();
      });
    });
  });
});
