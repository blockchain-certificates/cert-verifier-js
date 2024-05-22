import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import MocknetVCV2ValidFromValid from '../../fixtures/v3/mocknet-vc-v2-validUntil-expired.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('given the certificate is an expired validUntil', function () {
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

  it('should set the expected error message', function () {
    expect(result.message).toBe('This certificate has expired.');
  });
});
