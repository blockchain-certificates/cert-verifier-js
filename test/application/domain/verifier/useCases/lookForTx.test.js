import domain from '../../../../../src/domain';
import { BLOCKCHAINS, CERTIFICATE_VERSIONS, CONFIG } from '../../../../../src/constants';
import { BitcoinExplorers } from '../../../../../src/explorers';

describe('Verifier domain lookForTx use case test suite', function () {
  const MOCK_TRANSACTION_ID = 'mock-transaction-id';
  let MOCK_CHAIN;
  const MOCK_CERTIFICATE_VERSION = CERTIFICATE_VERSIONS.V1_2;

  describe('given it is called with a transactionId, a chain and a certificateVersion', function () {
    describe('given the chain is invalid', () => {
      beforeEach(function () {
        MOCK_CHAIN = 'invalid-chain';
      });

      afterEach(function () {
        MOCK_CHAIN = BLOCKCHAINS.bitcoin.code;
      });

      it('should throw an error', () => {
        expect(domain.verifier.lookForTx(MOCK_TRANSACTION_ID, MOCK_CHAIN, MOCK_CERTIFICATE_VERSION)).rejects.toThrow('Invalid chain; does not map to known BlockchainExplorers.');
      });
    });

    describe('given MinimumBlockchainExplorers is less than 0', function () {
      const originalValue = CONFIG.MinimumBlockchainExplorers;
      beforeEach(function () {
        CONFIG.MinimumBlockchainExplorers = -1;
      });

      afterEach(function () {
        CONFIG.MinimumBlockchainExplorers = originalValue;
      });

      it('should throw an error', function () {
        expect(domain.verifier.lookForTx(MOCK_TRANSACTION_ID, MOCK_CHAIN, MOCK_CERTIFICATE_VERSION)).rejects.toThrow('Invalid application configuration; check the CONFIG.MinimumBlockchainExplorers configuration value');
      });
    });

    describe('given MinimumBlockchainExplorers ', function () {
      const originalValue = CONFIG.MinimumBlockchainExplorers;
      beforeEach(function () {
        CONFIG.MinimumBlockchainExplorers = BitcoinExplorers.length + 1;
      });

      afterEach(function () {
        CONFIG.MinimumBlockchainExplorers = originalValue;
      });

      it('should throw an error', function () {
        expect(domain.verifier.lookForTx(MOCK_TRANSACTION_ID, MOCK_CHAIN, MOCK_CERTIFICATE_VERSION)).rejects.toThrow('Invalid application configuration; check the CONFIG.MinimumBlockchainExplorers configuration value');
      });
    });
  });
});
