import sinon from 'sinon';
import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import fixtureBlockcertsV3BetaDid from '../../../../fixtures/v3/blockcerts-3.0-beta-did.json';
import { Issuer } from '../../../../../src/models/Issuer';
import * as requestService from '../../../../../src/services/request';
import didDocument from '../../../../fixtures/did.json';
import fixtureIssuerProfile from '../../../../fixtures/issuer-profile.json';

describe('Verifier domain getIssuerProfile use case test suite', function () {
  describe('given the issuer profile refers to a DID', function () {
    describe('and the DID method resolution is supported', function () {
      let requestStub: sinon.SinonStub;
      let issuerProfile: Issuer;

      beforeEach(async function () {
        requestStub = sinon.stub(requestService, 'request');
        requestStub.withArgs({
          url: 'https://resolver.identity.foundation/1.0/identifiers/did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q#key-1',
          forceHttp: true
        }).resolves(JSON.stringify({ didDocument }));
        requestStub.withArgs({
          url: 'https://raw.githubusercontent.com/lemoustachiste/did-blockcerts-poc/master/issuer-profile.json'
        }).resolves(JSON.stringify(fixtureIssuerProfile));
        issuerProfile = await getIssuerProfile(fixtureBlockcertsV3BetaDid.issuer);
      });

      afterEach(function () {
        requestStub.restore();
        issuerProfile = null;
      });

      it('should return the DID document associated with the DID', function () {
        expect(issuerProfile.didDocument).toEqual(didDocument);
      });

      it('should return the issuer profile found from the did', function () {
        expect(issuerProfile.publicKey).toEqual([{
          id: 'ecdsa-koblitz-pubkey:mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          created: '2021-06-05T21:10:10.615+00:00'
        }]);
      });
    });
  });
});
