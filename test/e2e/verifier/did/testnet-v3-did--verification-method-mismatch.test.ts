import { Certificate, VERIFICATION_STATUSES } from '../../../../src';
import fixture from '../../../fixtures/v3/testnet-v3-did--verification-method-mismatch.json';
import sinon from 'sinon';
import domain from '../../../../src/domain';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import didDocument from '../../../fixtures/did/did:ion:EiAdjtCU7lOOND5xRgjpDiAB2DxAs9-QoFBAbcd3ttZsSA.json';
import fixtureIssuerProfile from '../../../fixtures/issuer-profile.json';

describe('Blockcerts v3 beta signed with DID test suite', function () {
  describe('given the proof holds a verification method', function () {
    describe('and the verification method does not match the provided issuer profile DID', function () {
      it('should not verify successfully', async function () {
        sinon.stub(domain.verifier, 'lookForTx').resolves({
          remoteHash: 'eb342568f2068271a59daf2db9e8060274aa8f2efcc9c726e094fbe8f1256325',
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          time: '2022-02-03T14:08:54.000Z',
          revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
        });
        const requestStub = sinon.stub(ExplorerLookup, 'request');
        requestStub.withArgs({
          url: 'https://resolver.identity.foundation/1.0/identifiers/did:ion:EiAdjtCU7lOOND5xRgjpDiAB2DxAs9-QoFBAbcd3ttZsSA'
        }).resolves(JSON.stringify({ didDocument }));
        requestStub.withArgs({
          url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
        }).resolves(JSON.stringify(fixtureIssuerProfile));

        const certificate = new Certificate(fixture);
        await certificate.init();
        const result = await certificate.verify();
        expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(result.message).toBe('Issuer identity mismatch - The identity document provided by the issuer does not match the verification method');
        sinon.restore();
      });
    });
  });
});
