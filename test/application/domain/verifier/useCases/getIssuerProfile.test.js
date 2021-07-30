import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import * as RequestServices from '../../../../../src/services/request';
import issuerProfileV1JsonFixture from './fixtures/issuerProfileV1JsonFixture';
import fixtureBlockcertsV1 from '../../../../fixtures/v1/testnet-valid-1.2.json';
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
    const issuerProfileFixtureString = JSON.stringify(issuerProfileV1JsonFixture);
    const issuerAddressV1Fixture = fixtureBlockcertsV1.document.certificate.issuer;

    beforeEach(function () {
      stubRequest.resolves(issuerProfileFixtureString);
    });

    describe('and the Blockcerts version is not 3.0-alpha', function () {
      it('should request the profile address from the issuer object', async function () {
        await getIssuerProfile(issuerAddressV1Fixture);
        expect(stubRequest.getCall(0).args).toEqual([{ url: issuerAddressV1Fixture.id }]);
      });
    });

    describe('when the request is successful', function () {
      it('should return the issuer profile JSON object', async function () {
        stubRequest.resolves(issuerProfileFixtureString);
        const result = await getIssuerProfile(issuerAddressV1Fixture);
        expect(result).toEqual(issuerProfileV1JsonFixture);
      });
    });

    describe('when the request fails', function () {
      it('should throw an error', async function () {
        const errorMessageFixture = 'Unable to get issuer profile';
        stubRequest.rejects(errorMessageFixture);
        await getIssuerProfile(issuerAddressV1Fixture).catch(e => {
          expect(e.message).toBe(errorMessageFixture);
        });
      });
    });
  });
});
