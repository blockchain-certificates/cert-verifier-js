import { describe, it, expect } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/testnet-v3-verification-method-issuer-profile.json';
import fixtureIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('Proof verification method is bound to issuer profile test suite', function () {
  it('should verify', async function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureIssuerProfile));
    const certificate = new Certificate(fixture);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.message)
      .toEqual({
        label: 'Verified',
        description: 'The EcdsaSecp256k1Signature2019 signature of this document has been successfully verified.'
      });
  });
});
