import sinon from 'sinon';
import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import fixtureBlockcertsV3Did from '../../../../fixtures/v3/testnet-v3-did.json';
import { Issuer } from '../../../../../src/models/Issuer';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import didDocument from '../../../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../../../fixtures/issuer-profile.json';

describe('Verifier domain getIssuerProfile use case test suite', function () {
  describe('given the issuer profile refers to a DID', function () {
    describe('and the DID method resolution is supported', function () {
      let requestStub: sinon.SinonStub;
      let issuerProfile: Issuer;

      beforeEach(async function () {
        requestStub = sinon.stub(ExplorerLookup, 'request');
        requestStub.withArgs({
          url: 'https://resolver.identity.foundation/1.0/identifiers/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ'
        }).resolves(JSON.stringify({ didDocument }));
        requestStub.withArgs({
          url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
        }).resolves(JSON.stringify(fixtureIssuerProfile));
        issuerProfile = await getIssuerProfile(fixtureBlockcertsV3Did.issuer);
      });

      afterEach(function () {
        requestStub.restore();
        issuerProfile = null;
      });

      it('should return the DID document associated with the DID', function () {
        expect(issuerProfile.didDocument).toEqual(didDocument);
      });

      xit('should return the issuer profile found from the did', function () {
        expect(issuerProfile.publicKey).toEqual([{
          id: 'ecdsa-koblitz-pubkey:mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          created: '2021-06-05T21:10:10.615+00:00'
        }]);
      });
    });
  });
});
