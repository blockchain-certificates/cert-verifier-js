import { Certificate } from '../../src';
import FIXTURES from '../fixtures';
import verificationsStepsWithDID from '../assertions/verification-steps-v3-with-did';
import verificationsStepsV2Regtest from '../assertions/verification-steps-v2-regtest';
import verificationsStepsV2Mainnet from '../assertions/verification-steps-v2-mainnet';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { universalResolverUrl } from '../../src/domain/did/valueObjects/didResolver';
import didDocument from '../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../fixtures/issuer-profile.json';
import v2IssuerProfile from '../assertions/v2-issuer-profile-5a4fe9931f607f0f3452a65e.json';
import v2RegtestIssuerProfile from '../assertions/v2-testnet-issuer-profile.json';

describe('Certificate API Contract test suite', function () {
  describe('VerificationSteps object', function () {
    let requestStub;

    beforeEach(function () {
      requestStub = sinon.stub(ExplorerLookup, 'request');
    });

    afterEach(function () {
      sinon.restore();
    });

    it('is available for a Mocknet/Regtest certificate', async function () {
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/2.0/issuer-testnet.json'
      }).resolves(JSON.stringify(v2RegtestIssuerProfile));
      const instance = new Certificate(FIXTURES.RegtestV2Valid);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationsStepsV2Regtest);
    });

    it('is available for a Mainnet certificate', async function () {
      requestStub.withArgs({
        url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json'
      }).resolves(JSON.stringify(v2IssuerProfile));
      const instance = new Certificate(FIXTURES.MainnetV2Valid);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationsStepsV2Mainnet);
    });

    it('is available for a certificate with DID', async function () {
      requestStub.withArgs({
        url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
      }).resolves(JSON.stringify({ didDocument }));
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
      }).resolves(JSON.stringify(fixtureIssuerProfile));
      const instance = new Certificate(FIXTURES.BlockcertsV3);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationsStepsWithDID);
    });
  });
});
