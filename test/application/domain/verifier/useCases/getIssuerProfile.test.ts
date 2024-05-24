import { describe, it, expect, beforeAll, afterAll, vi, afterEach } from 'vitest';
import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import issuerProfileV2JsonFixture from './fixtures/issuerProfileV2JsonFixture';
import fixtureBlockcertsV3Alpha from '../../../../fixtures/v3/blockcerts-3.0-alpha.json';
import fixtureBlockcertsV2 from '../../../../fixtures/v2/mainnet-valid-2.0.json';

const spy = vi.fn();
const failingUrl = 'https://failing.url';

describe('Verifier domain getIssuerProfile use case test suite', function () {
  beforeAll(function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          spy(url); // pass the url to the spy for later comparison

          if (url === failingUrl) {
            return await Promise.reject(new Error('error'));
          }

          return JSON.stringify(issuerProfileV2JsonFixture);
        }
      };
    });
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  afterEach(function () {
    spy.mockClear();
  });

  describe('given it is called without an issuerAddress parameter', function () {
    it('should throw an error', async function () {
      // @ts-expect-error: we are testing an empty case
      await getIssuerProfile().catch(e => {
        expect(e.message).toBe('Unable to get issuer profile - no issuer address given');
      });
    });
  });

  describe('given it is called with an issuerAddress parameter', function () {
    const issuerAddressV2Fixture = fixtureBlockcertsV2.badge.issuer;

    describe('and the Blockcerts version is 3.0-alpha', function () {
      const issuerAddressV3AlphaFixture = fixtureBlockcertsV3Alpha.issuer;

      it('should request the profile address', async function () {
        await getIssuerProfile(issuerAddressV3AlphaFixture);
        expect(spy.mock.calls[0][0]).toEqual(fixtureBlockcertsV3Alpha.issuer);
      });
    });

    describe('and the Blockcerts version is v2', function () {
      it('should request the profile address from the issuer object', async function () {
        await getIssuerProfile(issuerAddressV2Fixture);
        expect(spy.mock.calls[0][0]).toEqual(issuerAddressV2Fixture.id);
      });
    });

    describe('when the request is successful', function () {
      it('should return the issuer profile JSON object', async function () {
        const result = await getIssuerProfile(issuerAddressV2Fixture);
        expect(result).toEqual(issuerProfileV2JsonFixture);
      });
    });

    describe('when the request fails', function () {
      it('should throw an error', async function () {
        const errorMessageFixture = 'Unable to get issuer profile';
        await getIssuerProfile(failingUrl).catch(e => {
          expect(e.message).toBe(errorMessageFixture);
        });
      });
    });
  });
});
