import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/proof-chain-example.json';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import multipleProofsVerificationSteps from '../../assertions/verification-steps-v3-multiple-proofs';
import didKeyDocument from '../../fixtures/did/did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../fixtures/issuer-profile.json';

describe('proof chain example', function () {
  beforeEach(function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: `${universalResolverUrl}/${fixture.issuer}`
    }).resolves(JSON.stringify({ didDocument: didKeyDocument }));
    requestStub.withArgs({
      url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
    }).resolves(JSON.stringify({ didDocument }));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureIssuerProfile));
  });

  afterEach(function () {
    sinon.restore();
  });

  it('creates the valid verification process', async function () {
    const instance = new Certificate(fixture as any);
    await instance.init();
    expect(instance.verificationSteps).toEqual(multipleProofsVerificationSteps);
  });

  it('verifies as expected', async function () {
    const instance = new Certificate(fixture as any);
    await instance.init();
    const result = await instance.verify();
    expect(result.message).toEqual({
      // eslint-disable-next-line no-template-curly-in-string
      description: 'This is a valid ${chain} certificate.',
      label: 'Verified',
      linkText: 'View transaction link'
    });
    expect(result.status).toBe('success');
  });
});
