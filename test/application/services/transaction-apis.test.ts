import { buildTransactionServiceUrl } from '../../../src/services/transaction-apis';
import { explorerApi as Blockcypher } from '../../../src/explorers/bitcoin/blockcypher';
import { explorerApi as Etherscan } from '../../../src/explorers/ethereum/etherscan';

describe('Transaction APIs test suite', function () {
  let fixtureApi;
  const fixtureTransactionId = 'fixture-transaction-id';

  describe('buildTransactionServiceUrl method', function () {
    describe('handling test APIs', function () {
      beforeEach(function () {
        fixtureApi = Blockcypher;
      });

      describe('given isTestApi is set to false', function () {
        it('should return the mainnet address with the transaction ID', function () {
          expect(buildTransactionServiceUrl({
            explorerAPI: fixtureApi,
            transactionId: fixtureTransactionId
          })).toEqual(`https://api.blockcypher.com/v1/btc/main/txs/${fixtureTransactionId}?limit=500`);
        });
      });

      describe('given isTestApi is set to true', function () {
        it('should return the testnet address with the transaction ID', function () {
          expect(buildTransactionServiceUrl({
            explorerAPI: fixtureApi,
            transactionId: fixtureTransactionId,
            isTestApi: true
          })).toEqual(`https://api.blockcypher.com/v1/btc/test3/txs/${fixtureTransactionId}?limit=500`);
        });
      });
    });

    describe('given it is called with an API token', function () {
      const fixtureAPIToken = 'a-test-api-token';

      beforeEach(function () {
        fixtureApi = JSON.parse(JSON.stringify(Etherscan));
        fixtureApi.key = fixtureAPIToken;
        fixtureApi.keyPropertyName = 'apikey';
      });

      describe('and there are already some parameters in the URL', function () {
        it('should construct the URL to add the token with &', function () {
          const output = buildTransactionServiceUrl({
            explorerAPI: fixtureApi,
            transactionId: fixtureTransactionId
          });
          const expectedOutput = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=fixture-transaction-id&apikey=${fixtureAPIToken}`;
          expect(output).toBe(expectedOutput);
        });
      });

      describe('and there are no parameters in the URL yet', function () {
        it('should construct the URL to add the token with ?', function () {
          fixtureApi.serviceURL = 'https://api.etherscan.io/api';
          const output = buildTransactionServiceUrl({
            explorerAPI: fixtureApi,
            transactionId: fixtureTransactionId
          });
          const expectedOutput = `https://api.etherscan.io/api?apikey=${fixtureAPIToken}`;
          expect(output).toBe(expectedOutput);
        });
      });

      describe('and the keyPropertyName is not set', function () {
        it('should throw', function () {
          delete fixtureApi.keyPropertyName;
          expect(() => {
            buildTransactionServiceUrl({
              explorerAPI: fixtureApi,
              transactionId: fixtureTransactionId
            });
          }).toThrow('No keyPropertyName defined for explorerAPI etherscan');
        });
      });
    });
  });
});
