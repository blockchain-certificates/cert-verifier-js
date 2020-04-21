import { buildTransactionServiceUrl } from '../../../src/services/transaction-apis';
import * as Blockcypher from '../../../src/explorers/bitcoin/blockcypher';

describe('Transaction APIs test suite', function () {
  let fixtureApiName;
  const fixtureTransactionId = 'fixture-transaction-id';

  describe('buildTransactionServiceUrl method', function () {
    beforeEach(function () {
      fixtureApiName = Blockcypher.serviceURL;
    });

    describe('given isTestApi is set to false', function () {
      it('should return the mainnet address with the transaction ID', function () {
        expect(buildTransactionServiceUrl({
          serviceUrls: fixtureApiName,
          transactionId: fixtureTransactionId
        })).toEqual(`https://api.blockcypher.com/v1/btc/main/txs/${fixtureTransactionId}?limit=500`);
      });
    });

    describe('given isTestApi is set to true', function () {
      it('should return the testnet address with the transaction ID', function () {
        expect(buildTransactionServiceUrl({
          serviceUrls: fixtureApiName,
          transactionId: fixtureTransactionId,
          isTestApi: true
        })).toEqual(`https://api.blockcypher.com/v1/btc/test3/txs/${fixtureTransactionId}?limit=500`);
      });
    });
  });
});
