import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/proof-chain-example-ed25519.json';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import multipleProofsVerificationSteps from '../../assertions/verification-steps-v3-multiple-proofs';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../assertions/v3.0-issuer-profile.json';

describe('proof chain example', function () {
  let instance;

  beforeEach(async function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
    }).resolves(JSON.stringify({ didDocument }));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureIssuerProfile));
    sinon.stub(ExplorerLookup, 'lookForTx').resolves({
      remoteHash: '8303d22a9f391f0ac7deb0cd2e19cf2d582f6c93c8ddbb88bfae241041b5f951',
      issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
      time: '2022-05-03T17:24:07.000Z',
      revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
    });
    instance = new Certificate(fixture as any);
    await instance.init();
  });

  afterEach(function () {
    sinon.restore();
  });

  it('creates the valid verification process', function () {
    expect(instance.verificationSteps).toEqual(multipleProofsVerificationSteps);
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
