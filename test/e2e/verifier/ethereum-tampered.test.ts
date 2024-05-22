import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import domain from '../../../src/domain';
import EthereumTampered from '../../fixtures/v2/ethereum-tampered-2.0.json';

describe('given the certificate is a tampered ethereum', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    sinon.stub(domain.verifier, 'lookForTx').resolves({
      remoteHash: '4f48e91f0397a49a5b56718a78d681c51932c8bd9242442b94bcfb93434957db',
      issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
      time: '2018-05-08T18:30:34.000Z',
      revokedAddresses: []
    });
    sinon.stub(ExplorerLookup, 'request').withArgs({
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
      ]
    }));
    certificate = new Certificate(EthereumTampered);
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
    expect(result.message).toBe('Computed hash does not match remote hash');
  });
});
