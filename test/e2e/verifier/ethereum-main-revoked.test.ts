import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import domain from '../../../src/domain';
import EthereumMainRevoked from '../../fixtures/v2/ethereum-revoked-2.0.json';

describe('given the certificate is a revoked ethereum main', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    sinon.stub(domain.verifier, 'lookForTx').resolves({
      remoteHash: 'd95614994157a789ae321e114c7d8b1498997212b190c628d158bbfe38c3d1bb',
      issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
      time: '2018-05-09T14:23:49.000Z',
      revokedAddresses: []
    });
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'https://raw.githubusercontent.com/AnthonyRonning/https-github.com-labnol-files/master/issuer-eth.json?raw=true'
    }).resolves(JSON.stringify({
      '@context': [
        'https://w3id.org/openbadges/v2',
        'https://w3id.org/blockcerts/3.0'
      ],
      type: 'Profile',
      id: 'https://raw.githubusercontent.com/AnthonyRonning/https-github.com-labnol-files/master/issuer-eth.json?raw=true',
      publicKey: [
        {
          id: 'ecdsa-koblitz-pubkey:0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
          created: '2018-01-01T21:10:10.615+00:00'
        }
      ],
      revocationList: 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json'
    }));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json?assertionId=urn%3Auuid%3A3bc1a96a-3501-46ed-8f75-49612bbac257'
    }).resolves(JSON.stringify({
      revokedAssertions: [{
        id: 'urn:uuid:3bc1a96a-3501-46ed-8f75-49612bbac257',
        revocationReason: 'Accidentally issued to Ethereum.'
      }]
    }));
    certificate = new Certificate(EthereumMainRevoked);
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
    expect(result.message).toBe('This certificate has been revoked by the issuer. Reason given: Accidentally issued to Ethereum.');
  });
});
