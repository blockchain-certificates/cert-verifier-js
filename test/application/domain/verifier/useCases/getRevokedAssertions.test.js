import getRevokedAssertions from '../../../../../src/domain/verifier/useCases/getRevokedAssertions';
import { request } from '../../../../../src/services';
import revokedAssertionsFixture from './fixtures/revokedAssertionsFixture';

jest.mock('../../../../../src/services/request', () => jest.fn(() => undefined));

describe('Verifier domain getRevokedAssertions use case test suite', function () {
  const errorMessageAssertion = 'Unable to get revocation assertions';

  describe('given it is called without an revocationListUrl parameter', function () {
    it('should throw an error', async function () {
      await getRevokedAssertions().catch(e => {
        expect(e.message).toBe(errorMessageAssertion);
      });
    });
  });

  describe('given it is called with an revocationListUrl', function () {
    const revokedAssertionsAssertionString = JSON.stringify(revokedAssertionsFixture);
    const issuerIdFixture = 'http://domain.tld';

    describe('when the request is successful', function () {
      it('should return the revoked assertions JSON object', async function () {
        request.mockResolvedValue(revokedAssertionsAssertionString);
        const result = await getRevokedAssertions(issuerIdFixture);
        expect(result).toEqual(revokedAssertionsFixture.revokedAssertions);
      });
    });

    describe('when the request fails', function () {
      it('should throw an error', async function () {
        request.mockRejectedValue(errorMessageAssertion);
        await getRevokedAssertions(issuerIdFixture).catch(e => {
          expect(e.message).toBe(errorMessageAssertion);
        });
      });
    });
  });
});
