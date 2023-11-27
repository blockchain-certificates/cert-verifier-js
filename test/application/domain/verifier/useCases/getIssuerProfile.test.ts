import getIssuerProfile from '../../../../../src/domain/verifier/useCases/getIssuerProfile';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import sinon from 'sinon';
import issuerProfileV1JsonFixture from '../../../../fixtures/v1/got-issuer_live.json';
import fixtureV1 from '../../../../fixtures/v1/mainnet-valid-1.2.json';

describe('Verifier domain getIssuerProfile use case test suite', function () {
  let stubRequest;

  beforeEach(function () {
    stubRequest = sinon.stub(ExplorerLookup, 'request');
    stubRequest.resolves(JSON.stringify(issuerProfileV1JsonFixture));
  });

  afterEach(function () {
    stubRequest.restore();
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
    const issuerAddressV1Fixture = fixtureV1.document.certificate.issuer;

    describe('and the Blockcerts version is v1', function () {
      it('should request the profile address from the issuer object', async function () {
        await getIssuerProfile(issuerAddressV1Fixture);
        expect(stubRequest.getCall(0).args).toEqual([{ url: issuerAddressV1Fixture.id }]);
      });
    });

    describe('when the request is successful', function () {
      it('should return the issuer profile JSON object', async function () {
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
