import { describe, it, expect, vi } from 'vitest';
import { Certificate } from '../../../../src';
import fixture from '../../../fixtures/v3/vc-did-tdw-blockcerts.json';
import fixtureIssuerProfile from '../../../fixtures/issuer-blockcerts.json';
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

              // with DID:TDW, the DID document is resolved from the DID log file which is fetched

              if (url === 'https://www.blockcerts.org/samples/3.0/example-id-card-schema.json') {
                return JSON.stringify(fixtureCredentialSchema);
              }
            },
            lookForTx: () => ({
              remoteHash: '322681a05ea39e2648fdebc5edcf66228e7369bb61ff24f6449ff02d1b79d58a',
              issuingAddress: '0x40Cf9B7DB6FCc742ad0a76B8588C7f8De2b54a60',
              time: '2024-09-10T13:45:30.000Z',
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
