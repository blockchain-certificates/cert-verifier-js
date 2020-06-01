import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import * as Explorers from '../../../src/explorers/explorer';
import sinon from 'sinon';
import etherscanApiWithKey from '../../data/etherscan-key';

describe('given the certificate is a revoked ethereum main', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    sinon.stub(Explorers, 'getTransactionFromApi').resolves({
      remoteHash: 'd95614994157a789ae321e114c7d8b1498997212b190c628d158bbfe38c3d1bb',
      issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
      time: '2018-05-09T14:23:49.000Z',
      revokedAddresses: []
    });
    certificate = new Certificate(FIXTURES.EthereumMainRevoked, { explorerAPIs: [etherscanApiWithKey] });
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
