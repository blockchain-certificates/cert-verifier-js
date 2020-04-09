import { buildTransactionApiUrl } from '../../../src/services/transaction-apis';
import { TRANSACTION_APIS, TRANSACTION_ID_PLACEHOLDER } from '../../../src/constants';

describe('Transaction APIs test suite', function () {
  let fixtureApiName;
  const fixtureTransactionId = 'fixture-transaction-id';

  describe('buildTransactionApiUrl method', function () {
    describe('given the apiName is not found', function () {
      it('should return an error', function () {
        fixtureApiName = 'wrong-api-name';
        expect(() => {
          buildTransactionApiUrl({
            apiName: fixtureApiName,
            searchValue: TRANSACTION_ID_PLACEHOLDER,
            newValue: fixtureTransactionId
          });
        }).toThrowError(`API ${fixtureApiName} is not listed`);
      });
    });

    describe('given the apiName is defined', function () {
      beforeEach(function () {
        fixtureApiName = TRANSACTION_APIS.Blockcypher;
      });

      it('should not throw an error', function () {
        expect(() => {
          buildTransactionApiUrl({
            apiName: fixtureApiName,
            searchValue: TRANSACTION_ID_PLACEHOLDER,
            newValue: fixtureTransactionId
          });
        }).not.toThrowError();
      });

      describe('and testApi is set to false', function () {
        it('should return the mainnet address with the transaction ID', function () {
          expect(buildTransactionApiUrl({
            apiName: fixtureApiName,
            searchValue: TRANSACTION_ID_PLACEHOLDER,
            newValue: fixtureTransactionId
          })).toEqual(`https://api.blockcypher.com/v1/btc/main/txs/${fixtureTransactionId}?limit=500`);
        });
      });

      describe('and testApi is set to true', function () {
        it('should return the testnet address with the transaction ID', function () {
          expect(buildTransactionApiUrl({
            apiName: fixtureApiName,
            searchValue: TRANSACTION_ID_PLACEHOLDER,
            newValue: fixtureTransactionId,
            testApi: true
          })).toEqual(`https://api.blockcypher.com/v1/btc/test3/txs/${fixtureTransactionId}?limit=500`);
        });
      });
    });
  });
});
