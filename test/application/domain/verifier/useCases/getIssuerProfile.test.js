import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import * as PromisifiedRequests from '../../../../../src/promisifiedRequests';
import sinon from 'sinon';
import issuerProfileV2JsonFixture from './fixtures/issuerProfileV2JsonFixture';

describe('Verifier domain getIssuerProfile use case test suite', () => {
  describe('given it is called without an issuerId parameter', () => {
    it('should throw an error', async () => {
      await getIssuerProfile().catch(e => {
        expect(e.message).toBe('Unable to get issuer profile');
      });
    });
  });

  describe('given it is called with an issuerId', () => {
    const issuerProfileFixtureString = JSON.stringify(issuerProfileV2JsonFixture);
    const issuerIdFixture = 'http://domain.tld';

    let requestStub = sinon.stub(PromisifiedRequests, 'request').returns(new Promise(resolve => resolve(issuerProfileFixtureString)));

    describe('when the request is successful', () => {
      it('should return the issuer profile JSON object', async () => {
        const result = await getIssuerProfile(issuerIdFixture);
        expect(result).toEqual(issuerProfileV2JsonFixture);
      });
    });

    describe('when the request fails', () => {
      const errorMessageFixture = 'Unable to get issuer profile';

      afterEach(() => {
        requestStub.restore();
      });

      it('should throw an error', async () => {
        requestStub.returns(new Promise((resolve, reject) => reject(errorMessageFixture)));
        await getIssuerProfile(issuerIdFixture).catch(e => {
          expect(e.message).toBe(errorMessageFixture);
        });
      });
    });
  });
});
