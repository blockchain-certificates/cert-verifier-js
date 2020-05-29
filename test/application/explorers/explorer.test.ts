import sinon from 'sinon';
import * as RequestService from '../../../src/services/request';
import { explorerApi as BitpayAPI } from '../../../src/explorers/bitcoin/bitpay';
import { explorerApi as BlockcypherAPI } from '../../../src/explorers/bitcoin/blockcypher';
import * as mockBitpayResponse from './mocks/mockBitpayResponse.json';
import { getTransactionFromApi } from '../../../src/explorers/explorer';
import { BLOCKCHAINS } from '../../../src/constants';
import { VerifierError } from '../../../src/models';
import { ExplorerAPI } from '../../../src/certificate';
import { TRANSACTION_APIS } from '../../../src/constants/api';
import { getDefaultExplorers, overwriteDefaultExplorers } from '../../../src/explorers';

describe('Bitcoin Explorer test suite', function () {
  const fixtureTransactionId = '2378076e8e140012814e98a2b2cb1af07ec760b239c1d6d93ba54d658a010ecd';
  const assertionRequestUrl = `https://insight.bitpay.com/api/tx/${fixtureTransactionId}`;
  let stubRequest;
  const assertionResponse = {
    issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
    remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
    revokedAddresses: ['1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'],
    time: new Date(1518049414 * 1000)
  };

  beforeEach(function () {
    stubRequest = sinon.stub(RequestService, 'request').resolves(JSON.stringify(mockBitpayResponse));
  });

  afterEach(function () {
    stubRequest.restore();
  });

  describe('getTransactionFromApi method', function () {
    it('should call the right request API', async function () {
      await getTransactionFromApi(BitpayAPI, fixtureTransactionId, BLOCKCHAINS.bitcoin.code);
      expect(stubRequest.getCall(0).args).toEqual([{ url: assertionRequestUrl }]);
    });

    describe('given the API request failed', function () {
      it('should throw the right error', async function () {
        const fixtureError = new VerifierError('Unable to get remote hash');
        stubRequest.rejects(fixtureError);
        await expect(getTransactionFromApi(BitpayAPI, fixtureTransactionId, BLOCKCHAINS.bitcoin.code))
          .rejects.toThrow('Unable to get remote hash');
      });
    });

    describe('given the request is successful', function () {
      describe('and the transaction data is generated from the response', function () {
        it('should return a correct transaction data', async function () {
          const res = await getTransactionFromApi(BitpayAPI, fixtureTransactionId, BLOCKCHAINS.bitcoin.code);
          expect(res).toEqual(assertionResponse);
        });
      });
    });
  });

  describe('overwriteDefaultExplorers method', function () {
    describe('given it was passed a default explorer match', function () {
      it('should overwrite the data of that default explorer', function () {
        const fixtureExplorer: ExplorerAPI = {
          serviceName: TRANSACTION_APIS.bitpay,
          key: 'a-custom-key',
          keyPropertyName: 'apiKey'
        };

        const mockDefaultExplorer: ExplorerAPI = Object.assign({}, BitpayAPI);

        const output = overwriteDefaultExplorers([fixtureExplorer], [mockDefaultExplorer, BlockcypherAPI]);
        expect(output.find(explorerAPI => explorerAPI.serviceName === fixtureExplorer.serviceName).key)
          .toBe(fixtureExplorer.key);
      });

      it('should return the list of default explorers with the one modified', function () {
        const fixtureExplorer: ExplorerAPI = {
          serviceName: TRANSACTION_APIS.bitpay,
          key: 'a-custom-key',
          keyPropertyName: 'apiKey'
        };

        const mockDefaultExplorer: ExplorerAPI = Object.assign({}, BitpayAPI);

        const output = overwriteDefaultExplorers([fixtureExplorer], [mockDefaultExplorer, BlockcypherAPI]);
        const expectedOutput = [Object.assign(mockDefaultExplorer, fixtureExplorer), BlockcypherAPI];
        expect(output).toEqual(expectedOutput);
      });
    });

    describe('given it was passed no default explorer match', function () {
      it('should return the list of default explorers as expected', function () {
        const fixtureExplorer: ExplorerAPI = {
          serviceURL: 'https//another-service.com/api',
          key: 'a-custom-key',
          keyPropertyName: 'apiKey'
        };

        const output = overwriteDefaultExplorers([fixtureExplorer], [BitpayAPI, BlockcypherAPI]);
        const expectedOutput = [BitpayAPI, BlockcypherAPI];
        expect(output).toEqual(expectedOutput);
      });
    });
  });
});
