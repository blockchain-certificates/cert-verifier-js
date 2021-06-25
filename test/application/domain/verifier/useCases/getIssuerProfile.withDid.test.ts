import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import fixtureBlockcertsV3BetaDid from '../../../../fixtures/v3/blockcerts-3.0-beta-did.json';
import { Issuer } from '../../../../../src/models/Issuer';
import assertionIonDidDocument from '../../../../assertions/ion-did-document.json';

describe('Verifier domain getIssuerProfile use case test suite', function () {
  describe('given the issuer profile refers to a DID', function () {
    describe('and the DID method resolution is supported', function () {
      it('should return the DID document associated with the DID', async function () {
        const issuerProfile: Issuer = await getIssuerProfile(fixtureBlockcertsV3BetaDid.issuer);
        expect(issuerProfile.didDocument).toEqual(assertionIonDidDocument);
      });
    });

    describe('and the DID method resolution is not supported', function () {
      it('should throw', async function () {
        await expect(async () => {
          await getIssuerProfile('did:example:1234567890');
        })
          .rejects
          .toThrow('Unable to get issuer profile - Error: Unsupported did method: example used with blockcerts document');
      });
    });
  });
});
