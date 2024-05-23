import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import getRevokedAssertions from '../../../../../src/domain/verifier/useCases/getRevokedAssertions';
import revokedAssertionsFixture from './fixtures/revokedAssertionsFixture.json';

const spy = vi.fn();
const issuerIdFixtureNoRevokedAssertions = 'http://domain.tld/no-revoked-assertions';
const issuerIdFixtureWithRevokedAssertions = 'http://domain.tld/with-revoked-assertions';
const issuerIdFixtureRejects = 'http://domain.tld/rejects';
const errorMessageAssertion = 'Unable to get revocation assertions';

describe('Verifier domain getRevokedAssertions use case test suite', function () {

  beforeEach(function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          spy(url);

          if (url === issuerIdFixtureNoRevokedAssertions) {
            const revokedAssertionsAssertionCopy = { ...revokedAssertionsFixture };
            delete revokedAssertionsAssertionCopy.revokedAssertions;
            return JSON.stringify(revokedAssertionsAssertionCopy);
          }

          if (url === issuerIdFixtureRejects) {
            return Promise.reject(errorMessageAssertion);
          }

          return JSON.stringify(revokedAssertionsFixture);
        }
      };
    });
  });

  afterEach(function () {
    vi.restoreAllMocks();
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
    describe('and an assertionId', function () {
      it('should request the correct URL with the appended assertionId', async function () {
        const issuerIdFixture = 'http://domain.tld/path';
        const fixtureAssertionId = 'https://fixture-assertion-id.domain.tld';
        await getRevokedAssertions(issuerIdFixture, fixtureAssertionId);
        expect(spy.mock.calls[0][0]).toEqual('http://domain.tld/path?assertionId=https%3A%2F%2Ffixture-assertion-id.domain.tld');
      });
    });

    describe('when the request is successful', function () {
      describe('and the response does not have revokedAssertions', function () {
        it('should return an empty array', async function () {
          const result = await getRevokedAssertions(issuerIdFixtureNoRevokedAssertions);
          expect(result).toEqual([]);
        });
      });

      describe('and the response has revokedAssertions', function () {
        it('should return the revoked assertions JSON object', async function () {
          const result = await getRevokedAssertions(issuerIdFixtureWithRevokedAssertions);
          expect(result).toEqual(revokedAssertionsFixture.revokedAssertions);
        });
      });
    });

    describe('when the request fails', function () {
      it('should throw an error', async function () {
        // stubRequest.rejects(errorMessageAssertion);
        await getRevokedAssertions(issuerIdFixtureRejects).catch(e => {
          expect(e.message).toBe(errorMessageAssertion);
        });
      });
    });
  });
});
