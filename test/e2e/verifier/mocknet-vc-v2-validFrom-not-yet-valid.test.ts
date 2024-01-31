import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import MocknetVCV2ValidFromValid from '../../fixtures/v3/mocknet-vc-v2-validFrom-not-yet-valid.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('given the certificate is a not yet valid mocknet', function () {
  // this test will expire in 2039
  beforeAll(function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureBlockcertsIssuerProfile));
  });

  let certificate;
  let result;
  beforeEach(async function () {
    certificate = new Certificate(MocknetVCV2ValidFromValid);
    await certificate.init();
    result = await certificate.verify();
  });

  it('should fail verification', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('should expose the correct failure message', function () {
    expect(result.message).toBe('This certificate is not yet valid.');
  });
});
