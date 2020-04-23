import sinon from 'sinon';
import domain from '../../../../../src/domain';
import { CERTIFICATE_VERSIONS } from '../../../../../src/constants';
import { TExplorerAPIs } from '../../../../../src/verifier';
import { SupportedChains } from '../../../../../src/constants/blockchains';
import { TransactionData } from '../../../../../src/models/TransactionData';

describe('Verifier domain lookForTx use case test suite', function () {
  const MOCK_TRANSACTION_ID = 'mock-transaction-id';

  describe('given it is invoked with custom explorers with priority 0', function () {
    const mockTxData: TransactionData = {
      revokedAddresses: [],
      time: '2020-04-20T00:00:00Z',
      remoteHash: 'a-remote-hash',
      issuingAddress: 'an-issuing-address'
    };
    let stubbedExplorer: sinon.SinonStub;
    let stubbedDefaultExplorer: sinon.SinonStub;
    let mockExplorers: TExplorerAPIs;

    beforeEach(function () {
      stubbedExplorer = sinon.stub().resolves(mockTxData);
      stubbedDefaultExplorer = sinon.stub().resolves(mockTxData);
      mockExplorers = {
        bitcoin: [{
          parsingFunction: stubbedDefaultExplorer,
          priority: -1
        }],
        ethereum: [],
        v1: [],
        custom: [{
          parsingFunction: stubbedExplorer,
          priority: 0
        }]
      };
    });

    xdescribe('given the custom explorers return the transaction', function () {
      it('should call the custom explorer', async function () {
        await domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: SupportedChains.Bitcoin,
          certificateVersion: CERTIFICATE_VERSIONS.V2_0,
          explorerAPIs: mockExplorers
        });
        expect(stubbedExplorer.calledOnce).toBe(true);
      });

      it('should not call the default explorer', async function () {
        await domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: SupportedChains.Bitcoin,
          certificateVersion: CERTIFICATE_VERSIONS.V2_0,
          explorerAPIs: mockExplorers
        });
        expect(stubbedDefaultExplorer.calledOnce).toBe(false);
      });
    });

    xdescribe('given the custom explorers fail to return the transaction', function () {
      beforeEach(function () {
        stubbedExplorer.rejects('YO!!!');
      });

      it('should call the custom explorer', async function () {
        await domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: SupportedChains.Bitcoin,
          certificateVersion: CERTIFICATE_VERSIONS.V2_0,
          explorerAPIs: mockExplorers
        });
        expect(stubbedExplorer.calledOnce).toBe(true);
      });

      it('should call the default explorer', async function () {
        await domain.verifier.lookForTx({
          transactionId: MOCK_TRANSACTION_ID,
          chain: SupportedChains.Bitcoin,
          certificateVersion: CERTIFICATE_VERSIONS.V2_0,
          explorerAPIs: mockExplorers
        });
        expect(stubbedDefaultExplorer.calledOnce).toBe(true);
      });
    });
  });
});
