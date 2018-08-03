import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import * as Services from '../../../../../src/services';
import sinon from 'sinon';
import issuerProfileV2JsonFixture from './fixtures/issuerProfileV2JsonFixture';

describe('Verifier domain getIssuerProfile use case test suite', function () {
  describe('given it is called without an issuerId parameter', function () {
    it('should throw an error', async function () {
      await getIssuerProfile().catch(e => {
        expect(e.message).toBe('Unable to get issuer profile');
      });
    });
  });

  describe('given it is called with an issuerId', function () {
    const issuerProfileFixtureString = JSON.stringify(issuerProfileV2JsonFixture);
    const issuerIdFixture = 'http://domain.tld';

    let requestStub = sinon.stub(Services, 'request').returns(new Promise(resolve => resolve(issuerProfileFixtureString)));

    describe('when the request is successful', function () {
      it('should return the issuer profile JSON object', async function () {
        const result = await getIssuerProfile(issuerIdFixture);
        expect(result).toEqual(issuerProfileV2JsonFixture);
      });
    });

    describe('when the request fails', function () {
      const errorMessageFixture = 'Unable to get issuer profile';

      afterEach(function () {
        requestStub.restore();
      });

      it('should throw an error', async function () {
        requestStub.returns(new Promise((resolve, reject) => reject(errorMessageFixture)));
        await getIssuerProfile(issuerIdFixture).catch(e => {
          expect(e.message).toBe(errorMessageFixture);
        });
      });
    });
  });
});
