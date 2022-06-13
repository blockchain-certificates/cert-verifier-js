import { Certificate, VERIFICATION_STATUSES } from '../../../../src';
import fixture from '../../../fixtures/v3/testnet-v3-did--verification-method-not-referenced.json';
import sinon from 'sinon';
import domain from '../../../../src/domain';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import didDocument from '../../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../../fixtures/issuer-profile.json';
import { universalResolverUrl } from '../../../../src/domain/did/valueObjects/didResolver';

describe('Blockcerts v3 beta signed with DID test suite', function () {
  describe('given the proof holds a verification method', function () {
    describe('and the verification method is not listed in the issuer\'s DID document', function () {
      it('should not verify successfully', async function () {
        sinon.stub(domain.verifier, 'lookForTx').resolves({
          remoteHash: 'eca54e560dd43cccd900fa4bb9221f144d4c451c24beeddfd82e31db842bced1',
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          time: '2022-02-03T14:08:54.000Z',
          revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
        });
        const requestStub = sinon.stub(ExplorerLookup, 'request');
        requestStub.withArgs({
          url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
        }).resolves(JSON.stringify({ didDocument }));
        requestStub.withArgs({
          url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
        }).resolves(JSON.stringify(fixtureIssuerProfile));

        const certificate = new Certificate(fixture);
        await certificate.init();
        const result = await certificate.verify();
        expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(result.message).toBe('Issuer identity mismatch - The identity document provided by the issuer does not reference the verification method');
        sinon.restore();
      });
    });
  });
});
