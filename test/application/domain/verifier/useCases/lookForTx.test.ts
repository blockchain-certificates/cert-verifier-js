import domain from '../../../../../src/domain';
import { BLOCKCHAINS, CERTIFICATE_VERSIONS, CONFIG } from '../../../../../src/constants';
import {
  BitcoinExplorers,
  BlockchainExplorersWithSpentOutputInfo,
  defaultExplorers, EthereumExplorers
} from '../../../../../src/explorers';
import { TExplorerAPIs } from '../../../../../src/verifier';
import { getExplorersByChain } from '../../../../../src/domain/verifier/useCases/lookForTx';
import { SupportedChains } from '../../../../../src/constants/blockchains';

describe('Verifier domain lookForTx use case test suite', function () {
  const MOCK_TRANSACTION_ID = 'mock-transaction-id';
  let MOCK_CHAIN;
  const MOCK_CERTIFICATE_VERSION = CERTIFICATE_VERSIONS.V1_2;
  const mockExplorerAPIs: TExplorerAPIs = defaultExplorers;

  describe('selecting the explorers', function () {
    describe('given the certificate is V1', function () {
      it('should use the v1 specific explorers', function () {
        const selectedSelectors = getExplorersByChain(SupportedChains.Testnet, CERTIFICATE_VERSIONS.V1_2, defaultExplorers);
        expect(selectedSelectors).toEqual(BlockchainExplorersWithSpentOutputInfo);
      });
    });

    describe('given the certificate is not V1', function () {
      describe('and the chain is Ethereum main', function () {
        it('should use the ethereum specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Ethmain, CERTIFICATE_VERSIONS.V2_0, defaultExplorers);
          expect(selectedSelectors).toEqual(EthereumExplorers);
        });
      });

      describe('and the chain is Ethereum ropsten', function () {
        it('should use the ethereum specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Ethropst, CERTIFICATE_VERSIONS.V2_0, defaultExplorers);
          expect(selectedSelectors).toEqual(EthereumExplorers);
        });
      });

      describe('and the chain is Ethereum rinkeby', function () {
        it('should use the ethereum specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Ethrinkeby, CERTIFICATE_VERSIONS.V2_0, defaultExplorers);
          expect(selectedSelectors).toEqual(EthereumExplorers);
        });
      });

      describe('and the chain is Bitcoin mainnet', function () {
        it('should use the bitcoin specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Bitcoin, CERTIFICATE_VERSIONS.V2_0, defaultExplorers);
          expect(selectedSelectors).toEqual(BitcoinExplorers);
        });
      });

      describe('and the chain is Bitcoin mocknet', function () {
        it('should use the bitcoin specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Mocknet, CERTIFICATE_VERSIONS.V2_0, defaultExplorers);
          expect(selectedSelectors).toEqual(BitcoinExplorers);
        });
      });

      describe('and the chain is Bitcoin testnet', function () {
        it('should use the bitcoin specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Testnet, CERTIFICATE_VERSIONS.V2_0, defaultExplorers);
          expect(selectedSelectors).toEqual(BitcoinExplorers);
        });
      });

      describe('and the chain is Bitcoin regtest', function () {
        it('should use the bitcoin specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Regtest, CERTIFICATE_VERSIONS.V2_0, defaultExplorers);
          expect(selectedSelectors).toEqual(BitcoinExplorers);
        });
      });
    });
  });

  describe('given it is called with a transactionId, a chain and a certificateVersion', function () {
    describe('given the chain is invalid', () => {
      beforeEach(function () {
        MOCK_CHAIN = 'invalid-chain';
      });

      afterEach(function () {
        MOCK_CHAIN = BLOCKCHAINS.bitcoin.code;
      });

      it('should throw an error', () => {
        expect(domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: MOCK_CHAIN,
          certificateVersion: MOCK_CERTIFICATE_VERSION,
          explorerAPIs: mockExplorerAPIs})).rejects.toThrow('Invalid chain; does not map to known' +
          ' BlockchainExplorers.');
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
        expect(domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: MOCK_CHAIN,
          certificateVersion: MOCK_CERTIFICATE_VERSION,
          explorerAPIs: mockExplorerAPIs})).rejects.toThrow('Invalid application configuration;' +
          ' check the CONFIG.MinimumBlockchainExplorers configuration value');
      });
    });

    describe('given MinimumBlockchainExplorers is higher than BlockchainExplorers length', function () {
      const originalValue = CONFIG.MinimumBlockchainExplorers;
      beforeEach(function () {
        CONFIG.MinimumBlockchainExplorers = BitcoinExplorers.length + 1;
      });

      afterEach(function () {
        CONFIG.MinimumBlockchainExplorers = originalValue;
      });

      it('should throw an error', function () {
        expect(domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: MOCK_CHAIN,
          certificateVersion: MOCK_CERTIFICATE_VERSION,
          explorerAPIs: mockExplorerAPIs})).rejects.toThrow('Invalid application configuration;' +
          ' check the CONFIG.MinimumBlockchainExplorers configuration value');
      });
    });

    describe('given certificateVersion is v1', function () {
      describe('given MinimumBlockchainExplorers is higher than BlockchainExplorersWithSpentOutputInfo length', () => {
        const originalValue = CONFIG.MinimumBlockchainExplorers;
        beforeEach(() => {
          CONFIG.MinimumBlockchainExplorers = BlockchainExplorersWithSpentOutputInfo.length + 1;
        });
        afterEach(() => {
          CONFIG.MinimumBlockchainExplorers = originalValue;
        });
        it('should throw an error', function () {
          expect(domain.verifier.lookForTx({
            transactionId: MOCK_TRANSACTION_ID,
            chain: MOCK_CHAIN,
            certificateVersion: MOCK_CERTIFICATE_VERSION,
            explorerAPIs: mockExplorerAPIs})).rejects.toThrow('Invalid application configuration;' +
            ' check the CONFIG.MinimumBlockchainExplorers configuration value');
        });
      });
    });
  });
});
