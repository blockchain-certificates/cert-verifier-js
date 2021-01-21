import sinon from 'sinon';
import Certificate, { ExplorerAPI } from '../../src/certificate';
import * as requestService from '../../src/services/request';
import FIXTURES from '../fixtures';

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
        sinon.stub(requestService, 'request').resolves('{}');
        const explorerAPI: ExplorerAPI = {
          serviceURL: {
            main: 'https://blockcerts.org/test',
            test: 'https://blockcerts.org/test'
          },
          priority: 0,
          parsingFunction: parsingFunctionStub
        };

        const instance = new Certificate(FIXTURES.EthereumMainV2Valid, { explorerAPIs: [explorerAPI] });
        await instance.init();
        await instance.verify();
        expect(parsingFunctionStub.calledOnce).toBe(true);
        sinon.restore();
      });
    });
  });

  describe('given a custom explorer API with an identifying key is set', function () {
    describe('and the verification process occurs', function () {
      it('should call the explorer URL with the identifying information', async function () {
        const parsingFunctionStub: sinon.SinonStub = sinon.stub().resolves({
          remoteHash: 'ec049a808a09f3e8e257401e0898aa3d32a733706fd7d16aacf0ba95f7b42c0c',
          issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
          time: '2018-06-01T20:47:55.000Z',
          revokedAddresses: []
        });
        const requestStub = sinon.stub(requestService, 'request').resolves('{}');
        const explorerAPI: ExplorerAPI = {
          serviceURL: {
            main: 'https://blockcerts.org/test',
            test: 'https://blockcerts.org/test'
          },
          priority: 0,
          parsingFunction: parsingFunctionStub,
          key: 'user-id',
          keyPropertyName: 'identification-key'
        };

        const instance = new Certificate(FIXTURES.EthereumMainV2Valid, { explorerAPIs: [explorerAPI] });
        await instance.init();
        await instance.verify();
        expect(requestStub.getCall(0).args[0].url).toBe('https://blockcerts.org/test?identification-key=user-id');
        sinon.restore();
      });
    });
  });
});
