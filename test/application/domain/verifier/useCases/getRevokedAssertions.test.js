import getRevokedAssertions from '../../../../../src/domain/verifier/useCases/getRevokedAssertions';
import * as PromisifiedRequests from '../../../../../src/promisifiedRequests';
import sinon from 'sinon';
import revokedAssertionsFixture from './fixtures/revokedAssertionsFixture';

describe('Verifier domain getRevokedAssertions use case test suite', () => {
  const errorMessageAssertion = 'Unable to get revocation assertions';

  describe('given it is called without an revocationListUrl parameter', () => {
    it('should throw an error', async () => {
      await getRevokedAssertions().catch(e => {
        expect(e.message).toBe(errorMessageAssertion);
      });
    });
  });

  describe('given it is called with an revocationListUrl', () => {
    const revokedAssertionsAssertionString = JSON.stringify(revokedAssertionsFixture);
    const issuerIdFixture = 'http://domain.tld';

    let requestStub = sinon.stub(PromisifiedRequests, 'request').returns(new Promise(resolve => resolve(revokedAssertionsAssertionString)));

    describe('when the request is successful', () => {
      it('should return the revoked assertions JSON object', async () => {
        const result = await getRevokedAssertions(issuerIdFixture);
        expect(result).toEqual(revokedAssertionsFixture.revokedAssertions);
      });
    });

    describe('when the request fails', () => {
      afterEach(() => {
        requestStub.restore();
      });

      it('should throw an error', async () => {
        requestStub.returns(new Promise((resolve, reject) => reject(errorMessageAssertion)));
        await getRevokedAssertions(issuerIdFixture).catch(e => {
          expect(e.message).toBe(errorMessageAssertion);
        });
      });
    });
  });
});
