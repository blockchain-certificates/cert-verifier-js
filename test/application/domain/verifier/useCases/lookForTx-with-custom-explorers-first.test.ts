import sinon from 'sinon';
import domain from '../../../../../src/domain';
import { CERTIFICATE_VERSIONS } from '../../../../../src/constants';
import { TExplorerAPIs } from '../../../../../src/verifier';
import { SupportedChains } from '../../../../../src/constants/blockchains';
import { TransactionData } from '../../../../../src/models/TransactionData';

describe('Verifier domain lookForTx use case test suite', function () {
  const MOCK_TRANSACTION_ID = 'mock-transaction-id';
  const fixtureCustomTxData: TransactionData = {
    revokedAddresses: [],
    time: '2020-04-20T00:00:00Z',
    remoteHash: 'a-remote-hash',
    issuingAddress: 'from-custom-explorer'
  };

  const fixtureDefaultTxData: TransactionData = {
    revokedAddresses: [],
    time: '2020-04-20T00:00:00Z',
    remoteHash: 'a-remote-hash',
    issuingAddress: 'from-default-explorer'
  };

  describe('given it is invoked with custom explorers with priority 0', function () {
    let stubbedCustomExplorer: sinon.SinonStub;
    let stubbedDefaultExplorer: sinon.SinonStub;
    let mockExplorers: TExplorerAPIs;

    beforeEach(function () {
      stubbedCustomExplorer = sinon.stub().resolves(fixtureCustomTxData);
      stubbedDefaultExplorer = sinon.stub().resolves(fixtureDefaultTxData);
      mockExplorers = {
        bitcoin: [{
          parsingFunction: stubbedDefaultExplorer,
          priority: -1
        }],
        ethereum: [],
        v1: [],
        custom: [{
          parsingFunction: stubbedCustomExplorer,
          priority: 0
        }]
      };
    });

    afterEach(function () {
      stubbedCustomExplorer.resetHistory();
      stubbedDefaultExplorer.resetHistory();
    });

    describe('given the custom explorers return the transaction', function () {
      it('retrieve the response from the custom explorer', async function () {
        const response = await domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: SupportedChains.Bitcoin,
          certificateVersion: CERTIFICATE_VERSIONS.V2_0,
          explorerAPIs: mockExplorers
        });
        expect(response).toBe(fixtureCustomTxData);
      });
    });

    describe('given the custom explorers fail to return the transaction', function () {
      it('should call the custom explorer', async function () {
        stubbedCustomExplorer.rejects();
        const response = await domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: SupportedChains.Bitcoin,
          certificateVersion: CERTIFICATE_VERSIONS.V2_0,
          explorerAPIs: mockExplorers
        });
        expect(response).toBe(fixtureDefaultTxData);
      });
    });
  });
});
