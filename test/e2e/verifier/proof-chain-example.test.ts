import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/proof-chain-example.json';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import multipleProofsVerificationSteps from '../../assertions/verification-steps-v3-multiple-proofs';
import didKeyDocument from '../../fixtures/did/did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs';

describe('proof chain example', function () {
  beforeEach(function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: `${universalResolverUrl}/${fixture.issuer}`
    }).resolves(JSON.stringify({ didDocument: didKeyDocument }));
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
    expect(result.message).toBe('success');
  });
});
