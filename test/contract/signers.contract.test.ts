import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import FIXTURES from '../fixtures';
import { Certificate } from '../../src';
import { universalResolverUrl } from '../../src/domain/did/valueObjects/didResolver';
import didDocument from '../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../fixtures/issuer-profile.json';

describe('Certificate API Contract test suite', function () {
  describe('signers property', function () {
    describe('given there is only one signature to the document', function () {
      let instance;
      let requestStub;

      beforeEach(async function () {
        requestStub = sinon.stub(ExplorerLookup, 'request');
        requestStub.withArgs({
          url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
        }).resolves(JSON.stringify({ didDocument }));
        requestStub.withArgs({
          url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
        }).resolves(JSON.stringify(fixtureIssuerProfile));
        instance = new Certificate(FIXTURES.BlockcertsV3);
        await instance.init();
      });

      afterEach(function () {
        instance = null;
        sinon.restore();
      });

      it('should expose the signingDate', function () {
        expect(instance.signers[0].signingDate).toBe('2022-04-05T13:43:10.870521');
      });

      it.todo('should expose the signatureSuiteType');
      it.todo('should expose the issuerPublicKey');
      it.todo('should expose the issuerName');
      it.todo('should expose the issuerProfileDomain');
      it.todo('should expose the issuerProfileUrl');
      it.todo('should expose the chain');
      it.todo('should expose the transactionId');
      it.todo('should expose the transactionLink');
    });
  });
});
