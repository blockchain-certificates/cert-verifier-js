import { Certificate, VERIFICATION_STATUSES } from '../../../../src';
import fixture from '../../../fixtures/v3/testnet-v3-did.json';
import sinon from 'sinon';
import domain from '../../../../src/domain';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import didDocument from '../../../fixtures/did/modified-key-did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../../fixtures/issuer-profile.json';

describe('Blockcerts v3 beta signed with DID test suite', function () {
  describe('given the proof holds a verification method', function () {
    describe('and DID public key does not match the issuing address', function () {
      it('should fail the verification process', async function () {
        sinon.stub(domain.verifier, 'lookForTx').resolves({
          remoteHash: '05b306c28ac8f6e775b6e18052bc82d9c8fa430632a99294a38239e07a2595bd',
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          time: '2022-02-03T14:08:54.000Z',
          revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
        });
        const requestStub = sinon.stub(ExplorerLookup, 'request');
        requestStub.withArgs({
          url: 'https://resolver.identity.foundation/1.0/identifiers/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ'
        }).resolves(JSON.stringify({ didDocument }));
        requestStub.withArgs({
          url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
        }).resolves(JSON.stringify(fixtureIssuerProfile));

        const certificate = new Certificate(fixture);
        await certificate.init();
        const result = await certificate.verify();
        expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(result.message).toBe('Issuer identity mismatch - The provided verification method does not match the issuer identity');
        sinon.restore();
      });
    });
  });
});
