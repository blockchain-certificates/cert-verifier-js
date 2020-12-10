import sinon from 'sinon';
import * as RequestService from '../../../src/services/request';
import { explorerApi as BlockcypherAPI } from '../../../src/explorers/bitcoin/blockcypher';
import { explorerApi as BlockstreamAPI } from '../../../src/explorers/bitcoin/blockstream';
import * as mockBlockstreamResponse from './mocks/mockBlockstreamResponse.json';
import { getTransactionFromApi } from '../../../src/explorers/explorer';
import { BLOCKCHAINS } from '../../../src/constants';
import { VerifierError } from '../../../src/models';
import { ExplorerAPI } from '../../../src/certificate';
import { TRANSACTION_APIS } from '../../../src/constants/api';
import { getDefaultExplorers, overwriteDefaultExplorers } from '../../../src/explorers';

describe('Blockchain Explorers test suite', function () {
  const fixtureTransactionId = '2378076e8e140012814e98a2b2cb1af07ec760b239c1d6d93ba54d658a010ecd';
  const assertionRequestUrl = `https://blockstream.info/api/tx/${fixtureTransactionId}`;
  let stubRequest;
  const assertionResponse = {
    issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
    remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
    revokedAddresses: ['1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'],
    time: new Date(1518049414 * 1000)
  };

  beforeEach(function () {
    stubRequest = sinon.stub(RequestService, 'request').resolves(JSON.stringify(mockBlockstreamResponse));
  });

  afterEach(function () {
    stubRequest.restore();
  });

  describe('getTransactionFromApi method', function () {
    it('should call the right request API', async function () {
      await getTransactionFromApi(BlockstreamAPI, fixtureTransactionId, BLOCKCHAINS.bitcoin.code);
      expect(stubRequest.getCall(0).args).toEqual([{ url: assertionRequestUrl }]);
    });

    describe('given the API request failed', function () {
      it('should throw the right error', async function () {
        const fixtureError = new VerifierError('Unable to get remote hash');
        stubRequest.rejects(fixtureError);
        await expect(getTransactionFromApi(BlockstreamAPI, fixtureTransactionId, BLOCKCHAINS.bitcoin.code))
          .rejects.toThrow('Unable to get remote hash');
      });
    });

    describe('given the request is successful', function () {
      describe('and the transaction data is generated from the response', function () {
        it('should return a correct transaction data', async function () {
          const res = await getTransactionFromApi(BlockstreamAPI, fixtureTransactionId, BLOCKCHAINS.bitcoin.code);
          expect(res).toEqual(assertionResponse);
        });
      });
    });
  });

  describe('overwriteDefaultExplorers method', function () {
    describe('given it was passed a default explorer match', function () {
      it('should overwrite the data of that default explorer', function () {
        const fixtureExplorer: ExplorerAPI = {
          serviceName: TRANSACTION_APIS.blockstream,
          key: 'a-custom-key',
          keyPropertyName: 'apiKey'
        };

        const mockDefaultExplorer: ExplorerAPI = Object.assign({}, BlockstreamAPI);

        const output = overwriteDefaultExplorers([fixtureExplorer], [mockDefaultExplorer, BlockcypherAPI]);
        expect(output.find(explorerAPI => explorerAPI.serviceName === fixtureExplorer.serviceName).key)
          .toBe(fixtureExplorer.key);
      });

      it('should return the list of default explorers with the one modified', function () {
        const fixtureExplorer: ExplorerAPI = {
          serviceName: TRANSACTION_APIS.blockstream,
          key: 'a-custom-key',
          keyPropertyName: 'apiKey'
        };

        const mockDefaultExplorer: ExplorerAPI = Object.assign({}, BlockstreamAPI);

        const output = overwriteDefaultExplorers([fixtureExplorer], [mockDefaultExplorer, BlockcypherAPI]);
        const expectedOutput = [Object.assign(mockDefaultExplorer, fixtureExplorer), BlockcypherAPI];
        expect(output).toEqual(expectedOutput);
      });

      describe('and the explorer overwrite is malformed', function () {
        describe('when a key is set but no keyPropertyName', function () {
          it('should throw an error', function () {
            const fixtureExplorer: ExplorerAPI = {
              serviceName: TRANSACTION_APIS.blockstream,
              key: 'a-custom-key'
            };

            expect(() => {
              overwriteDefaultExplorers([fixtureExplorer], [BlockstreamAPI, BlockcypherAPI]);
            }).toThrow('Property keyPropertyName is not set for blockstream. Cannot pass the key property to the' +
              ' service.');
          });
        });
      });
    });

    describe('given it was passed no default explorer match', function () {
      it('should return the list of default explorers as expected', function () {
        const fixtureExplorer: ExplorerAPI = {
          serviceURL: 'https//another-service.com/api',
          key: 'a-custom-key',
          keyPropertyName: 'apiKey'
        };

        const output = overwriteDefaultExplorers([fixtureExplorer], [BlockstreamAPI, BlockcypherAPI]);
        const expectedOutput = [BlockstreamAPI, BlockcypherAPI];
        expect(output).toEqual(expectedOutput);
      });
    });
  });

  describe('getDefaultExplorers method', function () {
    // This is hard to test from a data point of view since we are wrapping the explorers
    it('should wrap the explorers and expose the getTxData method', function () {
      const output = getDefaultExplorers();
      expect(output.bitcoin[0].getTxData).toBeDefined();
    });

    it('should return the default explorers for bitcoin', function () {
      const output = getDefaultExplorers();
      expect(output.bitcoin.length).toBe(2);
    });

    it('should return the default explorers for ethereum', function () {
      const output = getDefaultExplorers();
      expect(output.ethereum.length).toBe(2);
    });

    it('should return the default explorers for v1 lookup', function () {
      const output = getDefaultExplorers();
      expect(output.v1.length).toBe(1);
    });

    describe('when it is called with custom explorers', function () {
      describe('and one of the custom explorers matches one of the default explorers', function () {
        it('should return the same expected amount of default explorers', function () {
          const fixtureExplorer: ExplorerAPI = {
            serviceName: TRANSACTION_APIS.blockstream,
            key: 'a-custom-key',
            keyPropertyName: 'apiKey'
          };
          const output = getDefaultExplorers([fixtureExplorer]);
          expect(output.bitcoin.length).toBe(2);
          expect(output.ethereum.length).toBe(2);
          expect(output.v1.length).toBe(1);
        });
      });

      describe('and none of the custom explorers matches the default explorers', function () {
        it('should return the same expected amount of default explorers', function () {
          const fixtureExplorer: ExplorerAPI = {
            serviceURL: 'https//another-service.com/api',
            key: 'a-custom-key',
            keyPropertyName: 'apiKey'
          };
          const output = getDefaultExplorers([fixtureExplorer]);
          expect(output.bitcoin.length).toBe(2);
          expect(output.ethereum.length).toBe(2);
          expect(output.v1.length).toBe(1);
        });
      });
    });
  });
});
