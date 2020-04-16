import { buildTransactionServiceUrl } from '../../../src/services/transaction-apis';
import { TRANSACTION_APIS, TRANSACTION_ID_PLACEHOLDER } from '../../../src/constants';
import { BitcoinAPIs } from '../../../src/explorers/bitcoin';

describe('Transaction APIs test suite', function () {
  let fixtureApiName;
  const fixtureTransactionId = 'fixture-transaction-id';

  describe('buildTransactionServiceUrl method', function () {
    beforeEach(function () {
      fixtureApiName = BitcoinAPIs[TRANSACTION_APIS.Blockcypher].serviceUrls;
    });

    describe('given testApi is set to false', function () {
      it('should return the mainnet address with the transaction ID', function () {
        expect(buildTransactionServiceUrl({
          serviceUrls: fixtureApiName,
          transactionIdPlaceholder: TRANSACTION_ID_PLACEHOLDER,
          transactionId: fixtureTransactionId
        })).toEqual(`https://api.blockcypher.com/v1/btc/main/txs/${fixtureTransactionId}?limit=500`);
      });
    });

    describe('given testApi is set to true', function () {
      it('should return the testnet address with the transaction ID', function () {
        expect(buildTransactionServiceUrl({
          serviceUrls: fixtureApiName,
          transactionIdPlaceholder: TRANSACTION_ID_PLACEHOLDER,
          transactionId: fixtureTransactionId,
          testApi: true
        })).toEqual(`https://api.blockcypher.com/v1/btc/test3/txs/${fixtureTransactionId}?limit=500`);
      });
    });
  });
});
