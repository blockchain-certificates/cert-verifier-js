import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/proof-chain-example-secp256k1.json';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
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
      remoteHash: '99d1c6fdb496eae6aa2e357833877ebe4187765780e43a4107fb7abd5968de78',
      issuingAddress: '0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60',
      time: '2022-07-15T16:03:48.000Z',
      revokedAddresses: []
    });
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
