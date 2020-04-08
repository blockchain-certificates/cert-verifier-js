import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import * as RequestServices from '../../../../../src/services/request';
import issuerProfileV2JsonFixture from './fixtures/issuerProfileV2JsonFixture';
import fixtureBlockcertsV3Alpha from '../../../../fixtures/v3/blockcerts-3.0-alpha';
import fixtureBlockcertsV2 from '../../../../fixtures/v2/mainnet-valid-2.0';
import sinon from 'sinon';

describe('Verifier domain getIssuerProfile use case test suite', function () {
  let stubRequest;

  beforeEach(function () {
    stubRequest = sinon.stub(RequestServices, 'request').resolves(undefined);
  });

  afterEach(function () {
    stubRequest.restore();
  });

  describe('given it is called without an issuerAddress parameter', function () {
    it('should throw an error', async function () {
      await getIssuerProfile().catch(e => {
        expect(e.message).toBe('Unable to get issuer profile - no issuer address given');
      });
    });
  });

  describe('given it is called with an issuerAddress parameter', function () {
    const issuerProfileFixtureString = JSON.stringify(issuerProfileV2JsonFixture);
    const issuerAddressV2Fixture = fixtureBlockcertsV2.badge.issuer;

    beforeEach(function () {
      stubRequest.resolves(issuerProfileFixtureString);
    });

    describe('and the Blockcerts version is 3.0-alpha', function () {
      const issuerAddressV3AlphaFixture = fixtureBlockcertsV3Alpha.issuer;

      it('should request the profile address', async function () {
        await getIssuerProfile(issuerAddressV3AlphaFixture);
        expect(stubRequest.getCall(0).args).toEqual([{ url: fixtureBlockcertsV3Alpha.issuer }]);
      });
    });

    describe('and the Blockcerts version is not 3.0-alpha', function () {
      it('should request the profile address from the issuer object', async function () {
        await getIssuerProfile(issuerAddressV2Fixture);
        expect(stubRequest.getCall(0).args).toEqual([{ url: issuerAddressV2Fixture.id }]);
      });
    });

    describe('when the request is successful', function () {
      it('should return the issuer profile JSON object', async function () {
        stubRequest.resolves(issuerProfileFixtureString);
        const result = await getIssuerProfile(issuerAddressV2Fixture);
        expect(result).toEqual(issuerProfileV2JsonFixture);
      });
    });

    describe('when the request fails', function () {
      it('should throw an error', async function () {
        const errorMessageFixture = 'Unable to get issuer profile';
        stubRequest.rejects(errorMessageFixture);
        await getIssuerProfile(issuerAddressV2Fixture).catch(e => {
          expect(e.message).toBe(errorMessageFixture);
        });
      });
    });
  });
});
