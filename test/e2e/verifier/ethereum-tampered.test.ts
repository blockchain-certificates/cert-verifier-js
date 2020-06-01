import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import * as Explorers from '../../../src/explorers/explorer';
import sinon from 'sinon';
import etherscanApiWithKey from '../../data/etherscan-key';

describe('given the certificate is a tampered ethereum', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    sinon.stub(Explorers, 'getTransactionFromApi').resolves({
      remoteHash: '4f48e91f0397a49a5b56718a78d681c51932c8bd9242442b94bcfb93434957db',
      issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
      time: '2018-05-08T18:30:34.000Z',
      revokedAddresses: []
    });
    certificate = new Certificate(FIXTURES.EthereumTampered, { explorerAPIs: [etherscanApiWithKey] });
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
