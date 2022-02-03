import { Certificate, VERIFICATION_STATUSES } from '../../../../src';
import fixture from '../../../fixtures/v3/testnet-v3-did.json';
import sinon from 'sinon';
import domain from '../../../../src/domain';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import didDocument from '../../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../../fixtures/issuer-profile.json';

describe('Blockcerts v3 beta signed with DID test suite', function () {
  describe('given the proof holds a verification method', function () {
    describe('and the verification method refers to a DID', function () {
      it('should resolve the DID document', async function () {
        sinon.stub(domain.verifier, 'lookForTx').resolves({
          remoteHash: 'fe611ad32790e9a34034e3de22459da6471bbce06f6bd55074262086cdff334c',
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
        expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
        // eslint-disable-next-line no-template-curly-in-string
        expect(result.message).toEqual({ description: 'This is a valid ${chain} certificate.', label: 'Verified', linkText: 'View transaction link' });
        sinon.restore();
      });
    });
  });
});
