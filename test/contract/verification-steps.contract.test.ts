import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate } from '../../src';
// import verificationsStepsV2Regtest from '../assertions/verification-steps-v2-regtest';
import verificationsStepsV1Mainnet from '../assertions/verification-steps-v1-mainnet';
import BlockcertsV1 from '../fixtures/v1/mainnet-valid-1.2.json';
import fixtureIssuerProfile from '../fixtures/v1/got-issuer_live.json';

describe('Certificate API Contract test suite', function () {
  describe('verificationSteps property', function () {
    let requestStub;

    beforeEach(function () {
      requestStub = sinon.stub(ExplorerLookup, 'request');
    });

    afterEach(function () {
      sinon.restore();
    });

    // it('is available for a Mocknet/Regtest certificate', async function () {
    //   requestStub.withArgs({
    //     url: 'https://www.blockcerts.org/samples/2.0/issuer-testnet.json'
    //   }).resolves(JSON.stringify(v2RegtestIssuerProfile));
    //   const instance = new Certificate(RegtestV2Valid);
    //   await instance.init();
    //   expect(instance.verificationSteps).toEqual(verificationsStepsV2Regtest);
    // });

    it('is available for a Mainnet certificate', async function () {
      requestStub.withArgs({
        url: 'http://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json'
      }).resolves(JSON.stringify(fixtureIssuerProfile));
      const instance = new Certificate(BlockcertsV1);
      await instance.init();
      expect(instance.verificationSteps).toEqual(verificationsStepsV1Mainnet);
    });
  });
});
