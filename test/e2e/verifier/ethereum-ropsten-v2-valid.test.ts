import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import * as ethereumExplorer from '../../../src/explorers/ethereum/etherscan';
import sinon from 'sinon';

describe('given the certificate is a valid ethereum ropsten', function () {
  it('should verify successfully', async function () {
    sinon.stub(ethereumExplorer, 'getEtherScanFetcher').resolves({
      remoteHash: '28b6d698afb0dd598954a7c7410f9ed722f7756850a97efe187ab0eab2a14831',
      issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
      time: '2018-05-30T03:14:05.000Z'
    });
    const certificate = new Certificate(FIXTURES.EthereumRopstenV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
