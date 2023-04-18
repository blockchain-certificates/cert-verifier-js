import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';
import BlockcertsStatusList2021Revocation from '../../fixtures/blockcerts-status-list-2021.json';
import BlockcertsStatusList2021Suspension from '../../fixtures/blockcerts-status-list-2021-suspension.json';
import StatusList2021Suspended from '../../fixtures/v3/cert-rl-status-list-2021-suspended.json';

describe('Status List 2021 v3 suspended example', function () {
  let requestStub;
  let result;

  beforeAll(async function () {
    requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureBlockcertsIssuerProfile));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
    }).resolves(JSON.stringify(BlockcertsStatusList2021Revocation));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json'
    }).resolves(JSON.stringify(BlockcertsStatusList2021Suspension));

    const instance = new Certificate(StatusList2021Suspended as any);
    await instance.init();
    result = await instance.verify();
  });

  afterAll(function () {
    sinon.restore();
  });

  it('should fail verification', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('should present the correct failure message', function () {
    expect(result.message).toBe('Certificate has been suspended.');
  });
});
