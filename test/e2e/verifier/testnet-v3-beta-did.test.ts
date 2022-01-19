import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/blockcerts-3.0-beta-did.json';
import sinon from 'sinon';
import domain from '../../../src/domain';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import didDocument from '../../fixtures/did.json';
import fixtureIssuerProfile from '../../fixtures/issuer-profile.json';

describe('Blockcerts v3 beta signed with DID test suite', function () {
  describe('given the proof holds a verification method', function () {
    describe('and the verification method refers to a DID', function () {
      it('should resolve the DID document', async function () {
        sinon.stub(domain.verifier, 'lookForTx').resolves({
          remoteHash: 'ba11964970034db4adef9fe9f4ff5705fa1897f34523c21568c501402983c54f',
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          time: '2021-06-25T12:42:54.000Z',
          revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
        });
        const requestStub = sinon.stub(ExplorerLookup, 'request');
        requestStub.withArgs({
          url: 'https://resolver.identity.foundation/1.0/identifiers/did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q#key-1'
        }).resolves(JSON.stringify({ didDocument }));
        requestStub.withArgs({
          url: 'https://raw.githubusercontent.com/lemoustachiste/did-blockcerts-poc/master/issuer-profile.json'
        }).resolves(JSON.stringify(fixtureIssuerProfile));

        const certificate = new Certificate(fixture);
        await certificate.init();
        const result = await certificate.verify();
        sinon.restore();
      });
    });
  });
});
