import { Certificate } from '../../../src';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import fixture from '../../fixtures/v3/example-non-chained-proofs.json';
import fixtureIssuerProfile from '../../assertions/v3.0-issuer-profile.json';

describe('proof chain example', function () {
  let instance;

  beforeEach(async function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureIssuerProfile));
    instance = new Certificate(fixture as any);
    await instance.init();
  });

  afterEach(function () {
    sinon.restore();
  });

  it('verifies as expected', async function () {
    const result = await instance.verify();
    expect(result.message).toEqual({
      description: 'All the signatures of this certificate have successfully verified.',
      label: 'Verified'
    });
    expect(result.status).toBe('success');
  });
});
