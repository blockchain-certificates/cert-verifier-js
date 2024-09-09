import { describe, it, expect, vi } from 'vitest';
import { Certificate } from '../../../../src';
import fixture from '../../../fixtures/v3/vc-did-tdw-blockcerts.json';
import didDocument from '../../../fixtures/did/did:tdw:QmfKd3jdBU6LZYyQAP7pQL3X8aEgfqrc9YGiy6Z3om4B3N:blockcerts.org.json';
import fixtureIssuerProfile from '../../../fixtures/issuer-blockcerts.json';
import { universalResolverUrl } from '../../../../src/domain/did/valueObjects/didResolver';
import fixtureCredentialSchema from '../../../fixtures/credential-schema-example-id-card.json';

describe('Blockcerts v3 signed with did:tdw method', function () {
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

              if (url === `${universalResolverUrl}/did:tdw:blockcerts.org:5mwc87zmepgqnh6gud7ah0z2uu8d`) {
                return JSON.stringify({ didDocument });
              }

              if (url === 'https://www.blockcerts.org/samples/3.0/example-id-card-schema.json') {
                return JSON.stringify(fixtureCredentialSchema);
              }
            },
            lookForTx: () => ({
              remoteHash: '024c79c30b140e3ba7377ef1b9c1160c8ac98fcf8e0fd453c56b5da32bd5c161',
              issuingAddress: '0x40Cf9B7DB6FCc742ad0a76B8588C7f8De2b54a60',
              time: '2024-09-05T13:45:30.000Z',
              revokedAddresses: []
            })
          };
        });

        const certificate = new Certificate(fixture);
        await certificate.init();
        const result = await certificate.verify();
        // expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
        // eslint-disable-next-line no-template-curly-in-string
        expect(result.message).toEqual({ description: 'This is a valid ${chain} certificate.', label: 'Verified', linkText: 'View transaction link' });
        vi.restoreAllMocks();
      });
    });
  });
});
