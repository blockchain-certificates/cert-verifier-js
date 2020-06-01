import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import * as Explorers from '../../../src/explorers/explorer';
import sinon from 'sinon';
import etherscanApiWithKey from '../../data/etherscan-key';

describe('given the certificate is a valid ethereum main', function () {
  it('should verify successfully', async function () {
    sinon.stub(Explorers, 'getTransactionFromApi').resolves({
      remoteHash: 'ec049a808a09f3e8e257401e0898aa3d32a733706fd7d16aacf0ba95f7b42c0c',
      issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
      time: '2018-06-01T20:47:55.000Z',
      revokedAddresses: []
    });
    const certificate = new Certificate(FIXTURES.EthereumMainV2Valid, { explorerAPIs: [etherscanApiWithKey] });
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    sinon.restore();
  });
});
