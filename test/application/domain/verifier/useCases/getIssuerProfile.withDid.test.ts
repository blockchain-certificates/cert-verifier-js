import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import fixtureBlockcertsV3Did from '../../../../fixtures/v3/testnet-v3-did.json';
import type { Issuer } from '../../../../../src/models/Issuer';
import { universalResolverUrl } from '../../../../../src/domain/did/valueObjects/didResolver';
import didDocument from '../../../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../../../fixtures/issuer-profile.json';
import didKeyDocument from '../../../../fixtures/did/did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs';

describe('Verifier domain getIssuerProfile use case test suite', function () {
  describe('given the issuer profile refers to a DID', function () {
    beforeAll(async function () {
      vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
        const explorerLookup = await importOriginal();
        return {
          ...explorerLookup,
          // replace some exports
          request: async function ({ url }) {
            if (url === `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`) {
              return JSON.stringify({ didDocument });
            }

            if (url === `${universalResolverUrl}/did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs`) {
              return JSON.stringify({ didDocument: didKeyDocument });
            }

            if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
              return JSON.stringify(fixtureIssuerProfile);
            }
          }
        };
      });
    });

    afterAll(function () {
      vi.restoreAllMocks();
    });

    describe('and the DID method resolution is supported', function () {
      let issuerProfile: Issuer;
      beforeAll(async function () {
        issuerProfile = await getIssuerProfile(fixtureBlockcertsV3Did.issuer);
      });

      it('should return the DID document associated with the DID', function () {
        expect(issuerProfile.didDocument).toEqual(didDocument);
      });

      it('should return the issuer profile found from the did', function () {
        expect(issuerProfile.publicKey).toEqual([{
          id: 'ecdsa-koblitz-pubkey:mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          created: '2021-06-05T21:10:10.615+00:00'
        }]);
      });
    });

    describe('and the DID method is did:key', function () {
      it('should create an expanded issuer profile', async function () {
        const initialDate = global.Date;
        class MockDate {
          toISOString (): string {
            return '2022-06-10T18:29:41.468Z';
          }

          static now (): number {
            return 1654885781468;
          }
        }
        global.Date = MockDate as any;

        const result = await getIssuerProfile(didKeyDocument.id);
        expect(result).toEqual({
          didDocument: didKeyDocument,
          '@context': [
            'https://w3id.org/openbadges/v2',
            'https://w3id.org/blockcerts/3.0'
          ],
          publicKey: [
            {
              created: new Date().toISOString(),
              id: 'z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs'
            }
          ]
        });

        global.Date = initialDate;
      });
    });
  });
});
