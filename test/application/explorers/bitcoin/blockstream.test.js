import * as mockBlockstreamResponse from '../mocks/mockBlockstreamResponse.json';
import { explorerApi } from '../../../../src/explorers/bitcoin/blockstream';

function getMockBlockstreamResponse () {
  return JSON.parse(JSON.stringify(mockBlockstreamResponse));
}

describe('Blockstream Explorer test suite', function () {
  let mockResponse;

  beforeEach(function () {
    mockResponse = getMockBlockstreamResponse();
  });

  describe('given the transaction has enough confirmations', function () {
    const assertionTransactionData = {
      issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
      remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
      revokedAddresses: ['1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'],
      time: new Date(1518049414 * 1000)
    };

    it('should return the transaction data', function () {
      expect(explorerApi.parsingFunction(mockResponse)).toEqual(assertionTransactionData);
    });
  });

  describe('given the transaction does not have enough confirmations yet', function () {
    it('should throw the right error', async function () {
      mockResponse.status.confirmed = false;
      expect(() => {
        explorerApi.parsingFunction(mockResponse);
      }).toThrowError('Number of transaction confirmations were less than the minimum required, according to Blockstream API');
    });
  });
});
