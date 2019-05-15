import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import { request } from '../../../../../src/services';
import issuerProfileV2JsonFixture from './fixtures/issuerProfileV2JsonFixture';

jest.mock('../../../../../src/services/request', () => jest.fn(() => undefined));

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

    describe('when the request is successful', function () {
      it('should return the issuer profile JSON object', async function () {
        request.mockResolvedValue(issuerProfileFixtureString);
        const result = await getIssuerProfile(issuerIdFixture);
        expect(result).toEqual(issuerProfileV2JsonFixture);
      });
    });

    describe('when the request fails', function () {
      it('should throw an error', async function () {
        const errorMessageFixture = 'Unable to get issuer profile';
        request.mockRejectedValue(errorMessageFixture);
        await getIssuerProfile(issuerIdFixture).catch(e => {
          expect(e.message).toBe(errorMessageFixture);
        });
      });
    });
  });
});
