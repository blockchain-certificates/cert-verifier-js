import sinon from 'sinon';
import domain from '../../../../../../src/domain/index';
import { CERTIFICATE_VERSIONS, CONFIG } from '../../../../../../src/constants/index';
import { getDefaultExplorers } from '../../../../../../src/explorers/index';
import { TExplorerAPIs } from '../../../../../../src/verifier';
import { getExplorersByChain } from '../../../../../../src/domain/verifier/useCases/lookForTx';
import { SupportedChains } from '../../../../../../src/constants/blockchains';
import { TransactionData } from '../../../../../../src/models/TransactionData';

describe('Verifier domain lookForTx use case test suite', function () {
  const MOCK_TRANSACTION_ID = 'mock-transaction-id';
  let MOCK_CHAIN;
  const MOCK_CERTIFICATE_VERSION = CERTIFICATE_VERSIONS.V1_2;
  const defaultExplorerAPIs: TExplorerAPIs = getDefaultExplorers();

  describe('selecting the explorers', function () {
    describe('given the certificate is V1', function () {
      it('should use the v1 specific explorers', function () {
        const selectedSelectors = getExplorersByChain(SupportedChains.Testnet, CERTIFICATE_VERSIONS.V1_2, getDefaultExplorers());
        // because they are wrapped, we don't necessarily have the deep nature of the result, so we use a weak test to ensure
        expect(selectedSelectors.length).toBe(1);
      });
    });

    describe('given the certificate is not V1', function () {
      describe('and the chain is Ethereum main', function () {
        it('should use the ethereum specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Ethmain, CERTIFICATE_VERSIONS.V2_0, getDefaultExplorers());
          // because they are wrapped, we don't necessarily have the deep nature of the result, so we use a weak test to ensure
          expect(selectedSelectors.length).toBe(2);
        });
      });

      describe('and the chain is Ethereum ropsten', function () {
        it('should use the ethereum specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Ethropst, CERTIFICATE_VERSIONS.V2_0, getDefaultExplorers());
          // because they are wrapped, we don't necessarily have the deep nature of the result, so we use a weak test to ensure
          expect(selectedSelectors.length).toBe(2);
        });
      });

      describe('and the chain is Ethereum rinkeby', function () {
        it('should use the ethereum specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Ethrinkeby, CERTIFICATE_VERSIONS.V2_0, getDefaultExplorers());
          // because they are wrapped, we don't necessarily have the deep nature of the result, so we use a weak test to ensure
          expect(selectedSelectors.length).toBe(2);
        });
      });

      describe('and the chain is Bitcoin mainnet', function () {
        it('should use the bitcoin specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Bitcoin, CERTIFICATE_VERSIONS.V2_0, getDefaultExplorers());
          // because they are wrapped, we don't necessarily have the deep nature of the result, so we use a weak test to ensure
          expect(selectedSelectors.length).toBe(4);
        });
      });

      describe('and the chain is Bitcoin mocknet', function () {
        it('should use the bitcoin specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Mocknet, CERTIFICATE_VERSIONS.V2_0, getDefaultExplorers());
          // because they are wrapped, we don't necessarily have the deep nature of the result, so we use a weak test to ensure
          expect(selectedSelectors.length).toBe(4);
        });
      });

      describe('and the chain is Bitcoin testnet', function () {
        it('should use the bitcoin specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Testnet, CERTIFICATE_VERSIONS.V2_0, getDefaultExplorers());
          // because they are wrapped, we don't necessarily have the deep nature of the result, so we use a weak test to ensure
          expect(selectedSelectors.length).toBe(4);
        });
      });

      describe('and the chain is Bitcoin regtest', function () {
        it('should use the bitcoin specific explorers', function () {
          const selectedSelectors = getExplorersByChain(SupportedChains.Regtest, CERTIFICATE_VERSIONS.V2_0, getDefaultExplorers());
          // because they are wrapped, we don't necessarily have the deep nature of the result, so we use a weak test to ensure
          expect(selectedSelectors.length).toBe(4);
        });
      });
    });
  });

  describe('given there are no custom explorers', function () {
    it('should call and resolve from the explorers passed', async function () {
      const mockTxData: TransactionData = {
        revokedAddresses: [],
        time: '2020-04-20T00:00:00Z',
        remoteHash: 'a-remote-hash',
        issuingAddress: 'an-issuing-address'
      };
      const stubbedExplorer = sinon.stub().resolves(mockTxData);
      const mockExplorers: TExplorerAPIs = {
        bitcoin: [{
          getTxData: stubbedExplorer
        }],
        ethereum: [],
        v1: []
      };
      const output = await domain.verifier.lookForTx({
        transactionId: 'a-transaction-id',
        chain: SupportedChains.Bitcoin,
        certificateVersion: CERTIFICATE_VERSIONS.V2_0,
        explorerAPIs: mockExplorers
      });
      expect(output).toEqual(mockTxData);
    });
  });

  describe('given it is called with a transactionId, a chain and a certificateVersion', function () {
    describe('given the chain is invalid', function () {
      it('should throw an error', async function () {
        await expect(domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: 'invalid-chain' as SupportedChains,
          certificateVersion: CERTIFICATE_VERSIONS.V2_0,
          explorerAPIs: defaultExplorerAPIs
        })).rejects.toThrow('Invalid chain; does not map to known BlockchainExplorers.');
      });
    });

    describe('given MinimumBlockchainExplorers is less than 0', function () {
      it('should throw an error', async function () {
        const originalValue = CONFIG.MinimumBlockchainExplorers;
        CONFIG.MinimumBlockchainExplorers = -1;
        await expect(domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: MOCK_CHAIN,
          certificateVersion: MOCK_CERTIFICATE_VERSION,
          explorerAPIs: defaultExplorerAPIs
        })).rejects.toThrow('Invalid application configuration;' +
          ' check the CONFIG.MinimumBlockchainExplorers configuration value');
        CONFIG.MinimumBlockchainExplorers = originalValue;
      });
    });

    describe('given MinimumBlockchainExplorers is higher than BlockchainExplorers length', function () {
      it('should throw an error', async function () {
        const originalValue = CONFIG.MinimumBlockchainExplorers;
        CONFIG.MinimumBlockchainExplorers = defaultExplorerAPIs.bitcoin.length + 1;
        await expect(domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: MOCK_CHAIN,
          certificateVersion: MOCK_CERTIFICATE_VERSION,
          explorerAPIs: defaultExplorerAPIs
        })).rejects.toThrow('Invalid application configuration;' +
          ' check the CONFIG.MinimumBlockchainExplorers configuration value');
        CONFIG.MinimumBlockchainExplorers = originalValue;
      });
    });

    describe('given certificateVersion is v1', function () {
      describe('given MinimumBlockchainExplorers is higher than BlockchainExplorersWithSpentOutputInfo length', function () {
        it('should throw an error', async function () {
          const originalValue = CONFIG.MinimumBlockchainExplorers;
          CONFIG.MinimumBlockchainExplorers = defaultExplorerAPIs.v1.length + 1;
          await expect(domain.verifier.lookForTx({
            transactionId: MOCK_TRANSACTION_ID,
            chain: MOCK_CHAIN,
            certificateVersion: MOCK_CERTIFICATE_VERSION,
            explorerAPIs: defaultExplorerAPIs
          })).rejects.toThrow('Invalid application configuration;' +
            ' check the CONFIG.MinimumBlockchainExplorers configuration value');
          CONFIG.MinimumBlockchainExplorers = originalValue;
        });
      });
    });
  });
});
