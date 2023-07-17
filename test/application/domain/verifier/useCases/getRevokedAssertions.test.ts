import getRevokedAssertions from '../../../../../src/domain/verifier/useCases/getRevokedAssertions';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import revokedAssertionsFixture from './fixtures/revokedAssertionsFixture.json';
import sinon from 'sinon';

describe('Verifier domain getRevokedAssertions use case test suite', function () {
  const errorMessageAssertion = 'Unable to get revocation assertions';
  let stubRequest;

  beforeEach(function () {
    stubRequest = sinon.stub(ExplorerLookup, 'request').resolves(undefined);
  });

  afterEach(function () {
    stubRequest.restore();
  });

  describe('given it is called without an revocationListUrl parameter', function () {
    it('should throw an error', async function () {
      // @ts-expect-error test case
      await getRevokedAssertions().catch(e => {
        expect(e.message).toBe(errorMessageAssertion);
      });
    });
  });

  describe('given it is called with an revocationListUrl', function () {
    const revokedAssertionsAssertionString = JSON.stringify(revokedAssertionsFixture);
    const issuerIdFixture = 'http://domain.tld/path';

    describe('and an assertionId', function () {
      it('should request the correct URL with the appended assertionId', async function () {
        stubRequest.resolves(revokedAssertionsAssertionString);
        const fixtureAssertionId = 'https://fixture-assertion-id.domain.tld';
        await getRevokedAssertions(issuerIdFixture, fixtureAssertionId);
        expect(stubRequest.getCall(0).args[0]).toEqual({
          url: 'http://domain.tld/path?assertionId=https%3A%2F%2Ffixture-assertion-id.domain.tld'
        });
      });
    });

    describe('when the request is successful', function () {
      describe('and the response does not have revokedAssertions', function () {
        it('should return an empty array', async function () {
          const revokedAssertionsAssertionCopy = { ...revokedAssertionsFixture };
          delete revokedAssertionsAssertionCopy.revokedAssertions;
          stubRequest.resolves(JSON.stringify(revokedAssertionsAssertionCopy));
          const result = await getRevokedAssertions(issuerIdFixture);
          expect(result).toEqual([]);
        });
      });

      describe('and the response has revokedAssertions', function () {
        it('should return the revoked assertions JSON object', async function () {
          stubRequest.resolves(revokedAssertionsAssertionString);
          const result = await getRevokedAssertions(issuerIdFixture);
          expect(result).toEqual(revokedAssertionsFixture.revokedAssertions);
        });
      });
    });

    describe('when the request fails', function () {
      it('should throw an error', async function () {
        stubRequest.rejects(errorMessageAssertion);
        await getRevokedAssertions(issuerIdFixture).catch(e => {
          expect(e.message).toBe(errorMessageAssertion);
        });
      });
    });
  });
});
