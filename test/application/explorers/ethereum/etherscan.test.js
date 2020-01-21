import * as mockEtherscanResponse from '../mocks/mockEtherscanResponse';
import * as mockEtherscanBlockResponse from '../mocks/mockEtherscanBlockResponse';
import * as EtherscanExplorer from '../../../../src/explorers/ethereum/etherscan';
import sinon from 'sinon';

function getMockEtherscanResponse () {
  return JSON.parse(JSON.stringify(mockEtherscanResponse));
}

const assertionTransactionData = {
  issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
  remoteHash: 'ec049a808a09f3e8e257401e0898aa3d32a733706fd7d16aacf0ba95f7b42c0c',
  revokedAddresses: undefined,
  time: new Date('2018-06-01T20:47:55.000Z')
};

describe('generateTransactionDataFromEtherscanResponse method', function () {
  let fixtureJsonResponse;
  let stubGetEtherScanBlock;

  beforeEach(function () {
    fixtureJsonResponse = getMockEtherscanResponse();
  });

  describe('given getting the scan block is successful', function () {
    beforeEach(function () {
      stubGetEtherScanBlock = sinon.stub(EtherscanExplorer, 'getEtherScanBlock').resolves(mockEtherscanBlockResponse);
    });

    afterEach(function () {
      stubGetEtherScanBlock.restore();
    });

    it('should return the transaction data', async function () {
      const res = await EtherscanExplorer.generateTransactionDataFromEtherscanResponse(fixtureJsonResponse, false);
      expect(res).toEqual(assertionTransactionData);
    });
  });
});
