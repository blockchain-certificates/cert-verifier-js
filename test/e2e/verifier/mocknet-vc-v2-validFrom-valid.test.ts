import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import MocknetVCV2ValidFromValid from '../../fixtures/v3/mocknet-vc-v2-validFrom-valid.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('given the certificate is a valid mocknet (v3.0)', function () {
  // this test will expire in 2029
  it('should verify successfully', async function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureBlockcertsIssuerProfile));

    const certificate = new Certificate(MocknetVCV2ValidFromValid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
