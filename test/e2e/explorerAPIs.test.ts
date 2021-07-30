import sinon from 'sinon';
import Certificate, { ExplorerAPI } from '../../src/certificate';
import FIXTURES from '../fixtures';
import * as RequestService from '@blockcerts/explorer-lookup/lib/cjs/services/request.js';

describe('explorerAPIs end to end test suite', function () {
  describe('given a custom explorer API with a parsingFunction is set', function () {
    describe('and the verification process occurs', function () {
      it('should call the parsing function', async function () {
        const parsingFunctionStub: sinon.SinonStub = sinon.stub().resolves({
          remoteHash: 'ec049a808a09f3e8e257401e0898aa3d32a733706fd7d16aacf0ba95f7b42c0c',
          issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
          time: '2018-06-01T20:47:55.000Z',
          revokedAddresses: []
        });
        const explorerAPI: ExplorerAPI = {
          serviceURL: {
            main: 'https://blockcerts.org/test',
            test: 'https://blockcerts.org/test'
          },
          priority: 0,
          parsingFunction: parsingFunctionStub
        };

        sinon.stub(RequestService, 'request').resolves('{}');

        const instance = new Certificate(FIXTURES.TestnetV1Valid, { explorerAPIs: [explorerAPI] });
        await instance.init();
        await instance.verify();
        expect(parsingFunctionStub.calledOnce).toBe(true);
        sinon.restore();
      });
    });
  });
});
