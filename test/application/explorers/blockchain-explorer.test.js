import sinon from 'sinon';
import * as RequestService from '../../../src/services/request';
import * as mockBitpayResponse from './mocks/mockBitpayResponse';
import { getBlockchainTransactionFromApi } from '../../../src/explorers/blockchain-explorer';
import { BLOCKCHAINS, TRANSACTION_APIS } from '../../../src/constants';

describe('Bitcoin Explorer test suite', function () {
  const fixtureTransactionId = '2378076e8e140012814e98a2b2cb1af07ec760b239c1d6d93ba54d658a010ecd';
  const assertionRequestUrl = `https://insight.bitpay.com/api/tx/${fixtureTransactionId}`;
  let stubRequest;
  let assertionResponse = {
    'issuingAddress': '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
    'remoteHash': 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
    'revokedAddresses': ['1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'],
    'time': new Date(1518049414 * 1000)
  };

  beforeEach(function () {
    stubRequest = sinon.stub(RequestService, 'request').resolves(JSON.stringify(mockBitpayResponse));
  });

  afterEach(function () {
    stubRequest.restore();
  });

  describe('getBlockchainTransactionFromApi method', function () {
    it('should call the right request API', function () {
      getBlockchainTransactionFromApi(TRANSACTION_APIS.Bitpay, fixtureTransactionId, BLOCKCHAINS.bitcoin.code).then(() => {
        expect(stubRequest.getCall(0).args).toEqual([{ url: assertionRequestUrl }]);
      });
    });

    describe('given the API request failed', function () {
      it('should throw the right error', async function () {
        const fixtureError = new Error('Unable to get remote hash');
        stubRequest.rejects(fixtureError);
        await getBlockchainTransactionFromApi(TRANSACTION_APIS.Bitpay, fixtureTransactionId, BLOCKCHAINS.bitcoin.code).catch(err => {
          expect(err).toEqual(fixtureError);
        });
      });
    });

    describe('given the request is successful', function () {
      describe('and the transaction data is generated from the response', function () {
        it('should return a correct transaction data', async function () {
          getBlockchainTransactionFromApi(TRANSACTION_APIS.Bitpay, fixtureTransactionId, BLOCKCHAINS.bitcoin.code).then(res => {
            expect(res).toEqual(assertionResponse);
          });
        });
      });
    });
  });
});
