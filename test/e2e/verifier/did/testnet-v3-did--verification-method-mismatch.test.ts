import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../../src';
import fixture from '../../../fixtures/v3/testnet-v3-did--verification-method-mismatch.json';
import didDocument from '../../../fixtures/did/did:ion:EiAdjtCU7lOOND5xRgjpDiAB2DxAs9-QoFBAbcd3ttZsSA.json';
import fixtureIssuerProfile from '../../../fixtures/issuer-blockcerts.json';
import { universalResolverUrl } from '../../../../src/domain/did/valueObjects/didResolver';
import verificationStepsV3WithDidSignedIssuerProfileAssertion
  from '../../../assertions/verification-steps-v3-with-did-signed-issuer-profile';

describe('Blockcerts v3 beta signed with DID test suite', function () {
  describe('given the proof holds a verification method', function () {
    describe('and the verification method does not match the provided issuer profile DID', function () {
      let certificate;
      let result;

      beforeAll(async function () {
        vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
          const explorerLookup = await importOriginal();
          return {
            ...explorerLookup,
            request: async function ({ url }) {
              if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
                return JSON.stringify(fixtureIssuerProfile);
              }

              if (url === `${universalResolverUrl}/did:ion:EiAdjtCU7lOOND5xRgjpDiAB2DxAs9-QoFBAbcd3ttZsSA`) {
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

        certificate = new Certificate(fixture);
        await certificate.init();
        result = await certificate.verify();
      });

      afterAll(function () {
        vi.restoreAllMocks();
      });

      it('should not verify successfully', function () {
        expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(result.message).toBe('Issuer identity mismatch - The identity document provided by the issuer does not match the verification method');
      });

      it('should verify the signed issuer profile as part of the verification steps', function () {
        expect(certificate.verificationSteps).toEqual(verificationStepsV3WithDidSignedIssuerProfileAssertion);
      });
    });
  });
});
