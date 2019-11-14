import * as mockBlockchainInfoResponse from '../../mocks/mockBlockchainInfoResponse';
import { generateTransactionDataFromBlockchainInfoResponse } from '../../../../../src/explorers/bitcoin/apis/blockchain-info';

function getMockBlockchainInfoResponse () {
  return JSON.parse(JSON.stringify(mockBlockchainInfoResponse));
}

describe('Blockchain Info Explorer test suite', function () {
  let mockResponse;

  beforeEach(function () {
    mockResponse = getMockBlockchainInfoResponse();
  });

  describe('given the transaction has enough confirmations', function () {
    const assertionTransactionData = {
      'issuingAddress': '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
      'remoteHash': 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
      'revokedAddresses': ['1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'],
      'time': 1518049383
    };

    it('should return the transaction data', function () {
      expect(generateTransactionDataFromBlockchainInfoResponse(mockResponse)).toEqual(assertionTransactionData);
    });
  });

  describe('given the transaction does not have enough confirmations yet', function () {
    it('should throw the right error', async function () {
      mockResponse.confirmations = 0;
      expect(() => {
        generateTransactionDataFromBlockchainInfoResponse(mockResponse);
      }).toThrowError('Number of transaction confirmations were less than the minimum required, according to Blockchain.info API');
    });
  });
});
