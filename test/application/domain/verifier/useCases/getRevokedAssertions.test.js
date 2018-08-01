import getRevokedAssertions from '../../../../../src/domain/verifier/useCases/getRevokedAssertions';
import * as Services from '../../../../../src/services';
import sinon from 'sinon';
import revokedAssertionsFixture from './fixtures/revokedAssertionsFixture';

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

    let requestStub = sinon.stub(Services, 'request').returns(new Promise(resolve => resolve(revokedAssertionsAssertionString)));

    describe('when the request is successful', function () {
      it('should return the revoked assertions JSON object', async function () {
        const result = await getRevokedAssertions(issuerIdFixture);
        expect(result).toEqual(revokedAssertionsFixture.revokedAssertions);
      });
    });

    describe('when the request fails', function () {
      afterEach(function () {
        requestStub.restore();
      });

      it('should throw an error', async function () {
        requestStub.returns(new Promise((resolve, reject) => reject(errorMessageAssertion)));
        await getRevokedAssertions(issuerIdFixture).catch(e => {
          expect(e.message).toBe(errorMessageAssertion);
        });
      });
    });
  });
});
