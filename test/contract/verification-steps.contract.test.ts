import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Certificate } from '../../src';
import { universalResolverUrl } from '../../src/domain/did/valueObjects/didResolver';
import verificationsStepsWithDID from '../assertions/verification-steps-v3-with-did';
import verificationsStepsNoDID from '../assertions/verification-steps-v3-no-did';
import verificationsStepsHashlink from '../assertions/verification-steps-v3-hashlink';
import verificationStepsValidFrom from '../assertions/verification-steps-v3-validFrom-mocknet';
import verificationsStepsV2Regtest from '../assertions/verification-steps-v2-regtest';
import verificationsStepsV2Mainnet from '../assertions/verification-steps-v2-mainnet';
import verificationsStepsV3CredentialSchema from '../assertions/verification-steps-v3-credentialSchema-mocknet';
import didDocument from '../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../fixtures/issuer-profile.json';
import v2IssuerProfile from '../assertions/v2-issuer-profile-5a4fe9931f607f0f3452a65e.json';
import v2RegtestIssuerProfile from '../assertions/v2-testnet-issuer-profile.json';
import RegtestV2Valid from '../fixtures/v2/regtest-valid-2.0.json';
import MainnetV2Valid from '../fixtures/v2/mainnet-valid-2.0.json';
import BlockcertsV3 from '../fixtures/v3/testnet-v3-did.json';
import BlockcertsV3NoDid from '../fixtures/v3/testnet-v3--no-did.json';
import BlockcertsV3Hashlink from '../fixtures/v3/testnet-v3-hashlink.json';
import BlockcertsV3ValidFrom from '../fixtures/v3/mocknet-vc-v2-invalid-date-format.json';
import BlockcertsV3CredentialSchema from '../fixtures/v3/mocknet-vc-v2-credential-schema.json';

describe('Certificate API Contract test suite', function () {
  describe('verificationSteps property', function () {
    beforeAll(function () {
      vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
        const explorerLookup = await importOriginal();
        return {
          ...explorerLookup,
          // replace some exports
          request: async function ({ url }) {
            if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
              return JSON.stringify(fixtureIssuerProfile);
            }

            if (url === 'https://www.blockcerts.org/samples/2.0/issuer-testnet.json') {
              return JSON.stringify(v2RegtestIssuerProfile);
            }

            if (url === 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json') {
              return JSON.stringify(v2IssuerProfile);
            }

            if (url === `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`) {
              return JSON.stringify({ didDocument });
            }

            console.log('url response not mocked', url);
          }
        };
      });
    });

    afterAll(function () {
      vi.restoreAllMocks();
    });

    it('is available for a Mocknet/Regtest certificate', async function () {
      const instance = new Certificate(RegtestV2Valid);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationsStepsV2Regtest);
    });

    it('is available for a Mainnet certificate', async function () {
      const instance = new Certificate(MainnetV2Valid);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationsStepsV2Mainnet);
    });

    it('is available for a V3 certificate with DID', async function () {
      const instance = new Certificate(BlockcertsV3);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationsStepsWithDID);
    });

    it('is available for a V3 certificate without DID', async function () {
      const instance = new Certificate(BlockcertsV3NoDid);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationsStepsNoDID);
    });

    it('is available for a V3 certificate with hashlinks to verify', async function () {
      const instance = new Certificate(BlockcertsV3Hashlink);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationsStepsHashlink);
    });

    it('is available for a V3 certificate with validFrom property set', async function () {
      const instance = new Certificate(BlockcertsV3ValidFrom);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationStepsValidFrom);
    });

    it('is available for a V3 certificate with credentialSchema property set', async function () {
      const instance = new Certificate(BlockcertsV3CredentialSchema);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationsStepsV3CredentialSchema);
    });
  });
});
