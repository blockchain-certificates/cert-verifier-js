import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import domain from '../../../src/domain';
import issuerBlockcertsV2a from '../../fixtures/issuer-blockcerts-v2a.json';
import TestnetRevokedIssuingAddressV2 from '../../fixtures/v2/testnet-revoked-key-2.0.json';

describe('given the certificate is a revoked testnet', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    sinon.stub(domain.verifier, 'lookForTx').resolves({
      remoteHash: '7570ad1a939b1d733668125df3e71ebbd593358e7d851eff3fdebd487462daab',
      issuingAddress: 'mkAvTwCYUyVk3rncFVCTJt1HUDsApVezhP',
      time: '2017-05-03T17:06:19.000Z',
      revokedAddresses: [
        'mkAvTwCYUyVk3rncFVCTJt1HUDsApVezhP'
      ]
    });
    sinon.stub(ExplorerLookup, 'request').withArgs({
      url: 'https://www.blockcerts.org/samples/2.0-alpha/issuerTestnet.json'
    }).resolves(JSON.stringify(issuerBlockcertsV2a));
    certificate = new Certificate(TestnetRevokedIssuingAddressV2);
    await certificate.init();
    result = await certificate.verify();
  });

  afterAll(function () {
    sinon.restore();
  });

  it('should fail', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('should expose the error message', function () {
    expect(result.message).toBe('The specified issuing address was revoked by the issuer before the transaction occurred.');
  });
});
